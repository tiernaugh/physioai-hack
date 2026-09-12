import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Move, Rotate3D, Scan, Focus, Plus, Minus } from 'lucide-react';
import { locations, progressStatus, progressMuscles } from './model';
import type { Region } from './model';

type Part = { id: string; positions: number; normals: number; indices: number; vertexCount: number; indexCount: number; bounds: [number[], number[]] };
type Preset = 'Front' | 'Back' | 'Left' | 'Right' | 'Iso left' | 'Iso right';
type Api = { preset: (name: Preset) => void; fit: () => void; focus: (region: Region) => void; zoom: (factor: number) => void; mode: (pan: boolean) => void };
const directions: Record<Preset, [number, number, number]> = { Front: [0, 0, 1], Back: [0, 0, -1], Left: [1, 0, 0], Right: [-1, 0, 0], 'Iso left': [1, .55, 1], 'Iso right': [-1, .55, 1] };

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

export default function RecordViewer({ selected, onSelect, draftRegions, focusRequest, resetRequest, view, progressStep }: { progressStep: number; view: 'notes' | 'progress'; selected: Region | null; onSelect: (region: Region) => void; draftRegions: Region[]; focusRequest: number; resetRequest: number }) {
  const mount = useRef<HTMLDivElement>(null);
  const api = useRef<Api | null>(null);
  const current = useRef({ selected, onSelect, draftRegions, view, progressStep });
  current.current = { selected, onSelect, draftRegions, view, progressStep };
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [preset, setPreset] = useState<Preset | ''>('Front');
  const [panMode, setPanMode] = useState(false);
  const shoulderButton = useRef<HTMLButtonElement>(null);
  const elbowButton = useRef<HTMLButtonElement>(null);
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
    let neutralColours: THREE.BufferAttribute | null = null;
    let progressColours: THREE.BufferAttribute | null = null;
    let colourBlend = 0;
    let displayColours: THREE.BufferAttribute | null = null;
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
    controls.target.set(0, .88, 0); controls.enablePan = true; controls.screenSpacePanning = true; controls.enableDamping = false;
    controls.minDistance = .4; controls.maxDistance = 7;
    const anchors = new Map<Region, THREE.Vector3>();
    const bodyBounds = new THREE.Box3();
    let tween: { start: number; position: THREE.Vector3; target: THREE.Vector3; endPosition: THREE.Vector3; endTarget: THREE.Vector3 } | null = null;
    function move(target: THREE.Vector3, offset: THREE.Vector3) {
      const endPosition = target.clone().add(offset);
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { camera.position.copy(endPosition); controls.target.copy(target); controls.update(); tween = null; }
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
      focus: region => { const anchor = anchors.get(region); if (anchor) move(anchor, offset().normalize().multiplyScalar(1.15)); },
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
        const neutral = new Float32Array(position.count * 3).fill(1);
        const coloured = new Float32Array(neutral);
        // mergeGeometries preserves input vertex order. Colour each complete source
        // mesh, rather than tinting nearby vertices across anatomical boundaries.
        const tint = new THREE.Color();
        let vertexOffset = 0;
        for (const part of atlas.parts) {
          const region = (Object.keys(progressMuscles) as Region[]).find(region => progressMuscles[region].ids.includes(part.id));
          if (region) {
            const status = progressStatus(region);
            tint.set(status === 'Improved' ? '#369467' : status === 'Worsened' ? '#bc6759' : '#d5a443');
            for (let i = 0; i < part.vertexCount; i++) tint.toArray(coloured, (vertexOffset + i) * 3);
          }
          vertexOffset += part.vertexCount;
        }
        neutralColours = new THREE.BufferAttribute(neutral, 3); progressColours = new THREE.BufferAttribute(coloured, 3);
        displayColours = new THREE.BufferAttribute(new Float32Array(neutral), 3);
        geometry.setAttribute('color', displayColours);
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
    const project = new THREE.Vector3();
    function animate(now: number) {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      if (tween) {
        const t = Math.min(1, (now - tween.start) / 320), eased = t * t * (3 - 2 * t);
        camera.position.lerpVectors(tween.position, tween.endPosition, eased); controls.target.lerpVectors(tween.target, tween.endTarget, eased);
        if (t === 1) tween = null;
      }
      if (merged && neutralColours && progressColours && displayColours) {
        const target = current.current.view === 'progress' && current.current.progressStep === 1 ? 1 : 0;
        const next = matchMedia('(prefers-reduced-motion: reduce)').matches ? target : colourBlend + (target - colourBlend) * .09;
        if (Math.abs(next - colourBlend) > .0001 || Math.abs(target - colourBlend) > .0001) {
          colourBlend = Math.abs(target - next) < .001 ? target : next;
          const output = displayColours.array, source = progressColours.array;
          for (let i = 0; i < output.length; i++) output[i] = 1 + (source[i] - 1) * colourBlend;
          displayColours.needsUpdate = true;
        }
      }
      controls.update(); renderer.render(scene, camera);
      for (const [region, anchor] of anchors) {
        const button = region === 'shoulder' ? shoulderButton.current : elbowButton.current;
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
      {ready && (Object.keys(locations) as Region[]).map((region, i) => <button ref={region === 'shoulder' ? shoulderButton : elbowButton} key={region} className={`br-marker ${view === 'progress' && progressStep === 1 ? progressStatus(region).toLowerCase() : ''} ${selected === region ? 'selected' : ''} ${draftRegions.includes(region) ? 'draft' : ''}`} aria-label={`Explore ${locations[region].label}`} aria-pressed={selected === region} onClick={() => current.current.onSelect(region)}><span>{i + 1}</span><b>{locations[region].label}{view === 'progress' ? ` · ${progressStep === 0 ? 'Baseline' : progressStatus(region)}` : ''}{draftRegions.includes(region) ? ' · Draft' : ''}</b></button>)}
    </div>
    {!ready && <div className="br-model-status" role={error ? 'alert' : 'status'}>{error || 'Loading reference anatomy…'}{error && <button onClick={() => setAttempt(attempt + 1)}>Retry model</button>}</div>}
    <div className="br-camera">
      <div className="br-view-picker"><div className="br-presets" role="group" aria-label="Camera orientation">{(Object.keys(directions) as Preset[]).map(name => <button className="br-view-choice" key={name} disabled={!ready} aria-label={name} aria-pressed={preset === name} data-tooltip={name.startsWith('Iso') ? `Three-quarter ${name.endsWith('left') ? 'left' : 'right'}` : `${name} view`} onClick={() => { api.current?.preset(name); setPreset(name); }}><ViewIcon view={name}/></button>)}</div><span className="br-view-caption">{preset ? preset.replace('Iso', 'Three-quarter') : 'Free view'}</span></div>
      <div className="br-manipulation" role="group" aria-label="Drag interaction"><button disabled={!ready} aria-label="Rotate body" aria-pressed={!panMode} data-tooltip="Drag to rotate" onClick={() => setPanMode(false)}><Rotate3D size={20}/></button><button disabled={!ready} aria-label="Pan body" aria-pressed={panMode} data-tooltip="Drag to pan" onClick={() => setPanMode(true)}><Move size={20}/></button></div>
      <div className="br-framing"><button disabled={!ready} aria-label="Fit body" data-tooltip="Fit whole body" onClick={() => api.current?.fit()}><Scan size={20}/></button><button disabled={!ready || !selected} aria-label="Focus selected" data-tooltip={!selected ? 'Select a region first' : 'Focus selected region'} onClick={() => selected && api.current?.focus(selected)}><Focus size={20}/></button><button disabled={!ready} aria-label="Zoom in" data-tooltip="Zoom in" onClick={() => api.current?.zoom(.8)}><Plus size={18}/></button><button disabled={!ready} aria-label="Zoom out" data-tooltip="Zoom out" onClick={() => api.current?.zoom(1.25)}><Minus size={18}/></button></div>
    </div>
    <p className="br-attribution">{panMode ? 'Drag to pan' : 'Drag to rotate'} · Right-drag or two fingers to pan · Scroll to zoom<br/>Reference anatomy · BodyParts3D / DBCLS · CC BY 4.0 · Markers show records, not severity</p>
  </div>;
}
