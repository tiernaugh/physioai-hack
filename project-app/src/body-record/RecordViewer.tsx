import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Move, Rotate3D, Scan, Focus, Plus, Minus } from 'lucide-react';
import { locations, statusAt, progressMuscles } from './model';
import type { Region, Status } from './model';
import { statusLabel } from './ProgressPanel';

type Part = { id: string; positions: number; normals: number; indices: number; vertexCount: number; indexCount: number; bounds: [number[], number[]] };
type Preset = 'Front' | 'Back' | 'Left' | 'Right' | 'Iso left' | 'Iso right';
type Api = { preset: (name: Preset) => void; fit: () => void; focus: (region: Region) => void; zoom: (factor: number) => void; mode: (pan: boolean) => void };
const directions: Record<Preset, [number, number, number]> = { Front: [0, 0, 1], Back: [0, 0, -1], Left: [1, 0, 0], Right: [-1, 0, 0], 'Iso left': [1, .55, 1], 'Iso right': [-1, .55, 1] };
const regionList = Object.keys(progressMuscles) as Region[];
// Vertex colours multiply the material's atlas colour (#c5bdaa): 1 = neutral, >1 washes toward the cream background.
const NEUTRAL = [1, 1, 1], PALE = [1.32, 1.32, 1.3];
const tints: Record<Exclude<Status, 'none'>, string> = { improved: '#369467', unchanged: '#d5a443', worsened: '#bc6759' };
const HIGHLIGHT = '#8fa779';

function ViewIcon({ view }: { view: Preset }) {
  const iso = view.startsWith('Iso');
  return <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
    <path d="M20 4 35 12 20 20 5 12Z" fill={iso ? 'currentColor' : 'none'} fillOpacity=".18"/>
    <path d="M5 12 20 20 20 36 5 28Z" fill={view === 'Front' || view === 'Right' || view === 'Iso right' ? 'currentColor' : 'none'} fillOpacity=".35"/>
    <path d="M20 20 35 12 35 28 20 36Z" fill={view === 'Back' || view === 'Left' || view === 'Iso left' ? 'currentColor' : 'none'} fillOpacity=".35"/>
    {view === 'Front' && <path d="m10 22 5 3m-2-4 2 4-2 2"/>}
    {view === 'Back' && <path d="m30 21-5 3m2-4-2 4 2 2" strokeDasharray="2 1"/>}
    {(view === 'Left' || view === 'Right') && <text x={view === 'Left' ? 27 : 12} y={view === 'Left' ? 27 : 28} textAnchor="middle" stroke="none" fill="currentColor" fontSize="9" fontWeight="700">{view === 'Left' ? 'L' : 'R'}</text>}
    {iso && <circle cx={view === 'Iso left' ? 35 : 5} cy="12" r="3" fill="currentColor" stroke="white"/>}
  </svg>;
}

export default function RecordViewer({ compact = false, selected, onSelect, draftRegions, focusRequest, resetRequest, date, isolate }: { compact?: boolean; date: string; isolate: Region | null; selected: Region | null; onSelect: (region: Region) => void; draftRegions: Region[]; focusRequest: number; resetRequest: number }) {
  const mount = useRef<HTMLDivElement>(null);
  const api = useRef<Api | null>(null);
  const current = useRef({ selected, onSelect, draftRegions, date, isolate });
  current.current = { selected, onSelect, draftRegions, date, isolate };
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [preset, setPreset] = useState<Preset | ''>('Front');
  const [panMode, setPanMode] = useState(false);
  const markers = useRef<Partial<Record<Region, HTMLButtonElement | null>>>({});
  useEffect(() => { if (selected) api.current?.focus(selected); }, [focusRequest]);
  useEffect(() => { api.current?.fit(); }, [resetRequest]);
  useEffect(() => { api.current?.mode(panMode); }, [panMode, ready]);

  useEffect(() => {
    const container = mount.current!;
    setError(''); setReady(false);
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch { setError('The 3D view is unavailable on this device. You can still explore the record using the region list.'); return; }
    let disposed = false, frame = 0;
    const abort = new AbortController();
    const geometries: THREE.BufferGeometry[] = [];
    const material = new THREE.MeshStandardMaterial({ color: '#c5bdaa', roughness: .78, vertexColors: true });
    let merged: THREE.BufferGeometry | null = null;
    // Per-vertex region index (0 = not part of a tracked region, 1.. = index into regionList) fixes the source mesh
    // each vertex belongs to, so colours never bleed across anatomical boundaries.
    let regionOfVertex: Uint8Array | null = null;
    let targetColours: Float32Array | null = null;
    let displayColours: THREE.BufferAttribute | null = null;
    let paletteKey = '', settled = true;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0, 0);
    renderer.domElement.setAttribute('aria-label', 'Reference anatomy. Drag to rotate; use labelled region buttons to explore.');
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x72816e, 2.4));
    const light = new THREE.DirectionalLight(0xfff7ed, 3); light.position.set(-3, 4, 4); scene.add(light);
    const backLight = new THREE.DirectionalLight(0xffffff, 2); backLight.position.set(3, 2, -4); scene.add(backLight);
    const camera = new THREE.PerspectiveCamera(32, 1, .01, 100);
    camera.position.set(0, .88, 3.5);
    const controls = new OrbitControls(camera, renderer.domElement);
    // Right-drag and two-finger drag pan in every mode; the toggle only changes what the primary drag does.
    controls.target.set(0, .88, 0); controls.enablePan = true; controls.screenSpacePanning = true; controls.enableDamping = false;
    controls.mouseButtons.RIGHT = THREE.MOUSE.PAN; controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
    controls.minDistance = .4; controls.maxDistance = 7;
    const anchors = new Map<Region, THREE.Vector3>();
    const bodyBounds = new THREE.Box3();
    let tween: { start: number; position: THREE.Vector3; target: THREE.Vector3; endPosition: THREE.Vector3; endTarget: THREE.Vector3 } | null = null;
    const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
    function move(target: THREE.Vector3, offset: THREE.Vector3) {
      const endPosition = target.clone().add(offset);
      if (reducedMotion()) { camera.position.copy(endPosition); controls.target.copy(target); controls.update(); tween = null; }
      else tween = { start: performance.now(), position: camera.position.clone(), target: controls.target.clone(), endPosition, endTarget: target.clone() };
    }
    const offset = () => camera.position.clone().sub(controls.target);
    const cancel = () => { tween = null; setPreset(''); };
    controls.addEventListener('start', cancel);
    api.current = {
      mode: pan => { controls.mouseButtons.LEFT = pan ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE; controls.touches.ONE = pan ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE; renderer.domElement.style.cursor = pan ? 'move' : 'grab'; },
      preset: name => move(controls.target, new THREE.Vector3(...directions[name]).normalize().multiplyScalar(offset().length())),
      fit: () => {
        const size = bodyBounds.getSize(new THREE.Vector3());
        const distance = Math.max(size.y, size.x / camera.aspect) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) * 1.25;
        move(bodyBounds.getCenter(new THREE.Vector3()), offset().normalize().multiplyScalar(Math.min(7, distance)));
      },
      focus: region => {
        const anchor = anchors.get(region); if (!anchor) return;
        const direction = offset().normalize();
        // The hamstring landmark sits on the posterior side; swing the camera behind the body if it is in front.
        if (region === 'hamstring' && direction.z > 0) { direction.z = -direction.z; setPreset(''); }
        move(anchor, direction.multiplyScalar(1.15));
      },
      zoom: factor => move(controls.target, offset().setLength(THREE.MathUtils.clamp(offset().length() * factor, .4, 7))),
    };
    const resize = () => { camera.aspect = container.clientWidth / Math.max(container.clientHeight, 1); camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth, container.clientHeight); };
    const observer = new ResizeObserver(resize); observer.observe(container); resize();
    const lost = (event: Event) => { event.preventDefault(); setReady(false); setError('The 3D session was interrupted. Retry to reload the model.'); };
    renderer.domElement.addEventListener('webglcontextlost', lost);
    async function load() {
      try {
        const response = await fetch('/models/muscle-atlas/atlas.json', { signal: abort.signal });
        if (!response.ok) throw new Error('The anatomy catalogue could not be loaded.');
        const atlas: { parts: Part[]; chunks: { url: string; bytes: number }[] } = await response.json();
        const chunk = atlas.chunks[0];
        const payload = await fetch(chunk.url, { signal: abort.signal });
        if (!payload.ok) throw new Error('The anatomy model could not be loaded.');
        let buffer = await payload.arrayBuffer();
        const signature = new Uint8Array(buffer);
        if (signature[0] === 31 && signature[1] === 139) buffer = await new Response(new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
        if (disposed) return;
        if (buffer.byteLength !== chunk.bytes) throw new Error('The anatomy download was incomplete.');
        const parts = atlas.parts.map(part => {
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(buffer, part.positions, part.vertexCount * 3), 3));
          geometry.setAttribute('normal', new THREE.BufferAttribute(new Int16Array(buffer, part.normals, part.vertexCount * 3), 3, true));
          geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(buffer, part.indices, part.indexCount), 1));
          return geometry;
        });
        const geometry = mergeGeometries(parts, false); parts.forEach(part => part.dispose());
        if (!geometry) throw new Error('The anatomy could not be assembled.');
        merged = geometry;
        const position = geometry.getAttribute('position');
        // mergeGeometries preserves input vertex order, so a running offset maps each source mesh to its vertices.
        const owner = new Uint8Array(position.count);
        let vertexOffset = 0;
        for (const part of atlas.parts) {
          const index = regionList.findIndex(region => progressMuscles[region].ids.includes(part.id));
          if (index >= 0) owner.fill(index + 1, vertexOffset, vertexOffset + part.vertexCount);
          vertexOffset += part.vertexCount;
        }
        regionOfVertex = owner;
        targetColours = new Float32Array(position.count * 3).fill(1);
        displayColours = new THREE.BufferAttribute(new Float32Array(position.count * 3).fill(1), 3);
        geometry.setAttribute('color', displayColours);
        paletteKey = '';
        geometries.push(geometry); geometry.computeBoundingBox(); bodyBounds.copy(geometry.boundingBox!);
        scene.add(new THREE.Mesh(geometry, material));
        for (const region of Object.keys(locations) as Region[]) {
          const part = atlas.parts.find(part => part.id === locations[region].anchorPart);
          if (!part) throw new Error(`Missing ${region} landmark.`);
          anchors.set(region, new THREE.Vector3(...part.bounds[0] as [number, number, number]).add(new THREE.Vector3(...part.bounds[1] as [number, number, number])).multiplyScalar(.5));
        }
        setReady(true); api.current?.fit();
      } catch (cause) { if (!disposed) setError(cause instanceof Error ? cause.message : 'Unable to load anatomy.'); }
    }
    void load();
    const tint = new THREE.Color();
    function retarget() {
      if (!regionOfVertex || !targetColours) return;
      const { date, isolate } = current.current;
      // Palette index 0 = untracked meshes, 1.. = regions. Isolation washes everything else toward the background.
      const palette: number[][] = [isolate ? PALE : NEUTRAL];
      for (const region of regionList) {
        const status = statusAt(region, date);
        if (isolate && isolate !== region) palette.push(PALE);
        else if (status === 'none') palette.push(isolate ? tint.set(HIGHLIGHT).toArray() : NEUTRAL);
        else palette.push(tint.set(tints[status]).toArray());
      }
      for (let v = 0; v < regionOfVertex.length; v++) {
        const colour = palette[regionOfVertex[v]];
        targetColours[v * 3] = colour[0]; targetColours[v * 3 + 1] = colour[1]; targetColours[v * 3 + 2] = colour[2];
      }
      settled = false;
    }
    const project = new THREE.Vector3();
    function animate(now: number) {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      if (tween) {
        const t = Math.min(1, (now - tween.start) / 320), eased = t * t * (3 - 2 * t);
        camera.position.lerpVectors(tween.position, tween.endPosition, eased); controls.target.lerpVectors(tween.target, tween.endTarget, eased);
        if (t === 1) tween = null;
      }
      if (merged && targetColours && displayColours) {
        const key = `${current.current.date}|${current.current.isolate ?? ''}`;
        if (key !== paletteKey) { paletteKey = key; retarget(); }
        if (!settled) {
          const output = displayColours.array as Float32Array, rate = reducedMotion() ? 1 : .1;
          let maxDelta = 0;
          for (let i = 0; i < output.length; i++) {
            const delta = targetColours[i] - output[i];
            if (Math.abs(delta) > maxDelta) maxDelta = Math.abs(delta);
            output[i] += delta * rate;
          }
          if (maxDelta < .004) { output.set(targetColours); settled = true; }
          displayColours.needsUpdate = true;
        }
      }
      controls.update(); renderer.render(scene, camera);
      for (const [region, anchor] of anchors) {
        const button = markers.current[region];
        if (!button) continue;
        project.copy(anchor).project(camera);
        button.style.left = `${(project.x + 1) * container.clientWidth / 2}px`;
        button.style.top = `${(1 - project.y) * container.clientHeight / 2}px`;
        button.style.visibility = Math.abs(project.x) > 1 || Math.abs(project.y) > 1 || Math.abs(project.z) > 1 ? 'hidden' : 'visible';
      }
    }
    frame = requestAnimationFrame(animate);
    return () => { disposed = true; abort.abort(); cancelAnimationFrame(frame); observer.disconnect(); controls.removeEventListener('start', cancel); controls.dispose(); geometries.forEach(g => g.dispose()); material.dispose(); renderer.domElement.removeEventListener('webglcontextlost', lost); renderer.dispose(); renderer.domElement.remove(); api.current = null; };
  }, [attempt]);

  return <div className="br-viewer">
    <div className="br-canvas" ref={mount}>
      {ready && (Object.keys(locations) as Region[]).map((region, i) => {
        const status = statusAt(region, date);
        return <button ref={element => { markers.current[region] = element; }} key={region} className={`br-marker ${status !== 'none' ? status : ''} ${selected === region ? 'selected' : ''} ${draftRegions.includes(region) ? 'draft' : ''} ${isolate && isolate !== region ? 'dimmed' : ''}`} aria-label={`Explore ${locations[region].label}${status !== 'none' ? `, ${statusLabel[status].toLowerCase()}` : ''}`} aria-pressed={selected === region} onClick={() => current.current.onSelect(region)}><span>{i + 1}</span><b>{locations[region].label}{status !== 'none' ? ` · ${statusLabel[status]}` : ''}{draftRegions.includes(region) ? ' · Draft' : ''}</b></button>;
      })}
    </div>
    {!ready && <div className="br-model-status" role={error ? 'alert' : 'status'}>{error || 'Loading reference anatomy…'}{error && <button onClick={() => setAttempt(attempt + 1)}>Retry model</button>}</div>}
    <div className="br-camera">
      <div className="br-view-picker"><div className="br-presets" role="group" aria-label="Camera orientation">{(Object.keys(directions) as Preset[]).filter(name => !compact || name === 'Front' || name === 'Back').map(name => <button className="br-view-choice" key={name} disabled={!ready} aria-label={name} aria-pressed={preset === name} data-tooltip={name.startsWith('Iso') ? `Three-quarter ${name.endsWith('left') ? 'left' : 'right'}` : `${name} view`} onClick={() => { api.current?.preset(name); setPreset(name); }}><ViewIcon view={name}/></button>)}</div><span className="br-view-caption">{preset ? preset.replace('Iso', 'Three-quarter') : 'Free view'}</span></div>
      <div className="br-manipulation" role="group" aria-label="Drag interaction"><button disabled={!ready} aria-label="Rotate body" aria-pressed={!panMode} data-tooltip="Drag to rotate" onClick={() => setPanMode(false)}><Rotate3D size={compact ? 16 : 20}/></button><button disabled={!ready} aria-label="Pan body" aria-pressed={panMode} data-tooltip="Drag to pan" onClick={() => setPanMode(true)}><Move size={compact ? 16 : 20}/></button></div>
      <div className="br-framing"><button disabled={!ready} aria-label="Fit body" data-tooltip="Fit whole body" onClick={() => api.current?.fit()}><Scan size={20}/></button>{!compact && <button disabled={!ready || !selected} aria-label="Focus selected" data-tooltip={!selected ? 'Select a region first' : 'Focus selected region'} onClick={() => selected && api.current?.focus(selected)}><Focus size={20}/></button>}<button disabled={!ready} aria-label="Zoom in" data-tooltip="Zoom in" onClick={() => api.current?.zoom(.8)}><Plus size={18}/></button><button disabled={!ready} aria-label="Zoom out" data-tooltip="Zoom out" onClick={() => api.current?.zoom(1.25)}><Minus size={18}/></button></div>
    </div>
    <p className="br-attribution">{compact ? `${panMode ? 'Drag to pan' : 'Drag to rotate'} · Two fingers to pan · Open a marker to explore your record` : `${panMode ? 'Drag to pan' : 'Drag to rotate'} · Right-drag or two fingers to pan · Scroll to zoom`}<br/>Reference anatomy · BodyParts3D / DBCLS · CC BY 4.0 · Colours show your reported change, not severity</p>
  </div>;
}
