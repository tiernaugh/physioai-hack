import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { Box, RotateCcw } from "lucide-react";
import { analysisMuscleRegion, regionAnchor, regionPosterior } from './analysis-anatomy';
import type { AnalysisRegion, Bounds } from './analysis-anatomy';
import type { AnatomyInsight } from "./agent-analysis";

type Atlas = {
  parts: { id: string; name: string; bounds: Bounds; positions: number; normals: number; indices: number; vertexCount: number; indexCount: number }[];
  chunks: { url: string; bytes: number }[];
};
let anatomy: Promise<{ atlas: Atlas; buffer: ArrayBuffer }> | undefined;
function loadAnatomy() {
  if (!anatomy) anatomy = (async () => {
    const catalogue = await fetch("/models/muscle-atlas/atlas.json");
    if (!catalogue.ok) throw new Error("The anatomy catalogue could not be loaded.");
    const atlas: Atlas = await catalogue.json();
    const response = await fetch(atlas.chunks[0].url);
    if (!response.ok) throw new Error("The anatomy could not be loaded.");
    const payload = await response.arrayBuffer();
    const signature = new Uint8Array(payload, 0, Math.min(2, payload.byteLength));
    const buffer = signature[0] === 0x1f && signature[1] === 0x8b
      ? await new Response(new Blob([payload]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer()
      : payload;
    if (buffer.byteLength !== atlas.chunks[0].bytes) throw new Error("The anatomy download was incomplete.");
    return { atlas, buffer };
  })().catch((error) => { anatomy = undefined; throw error; });
  return anatomy;
}
const defaultHighlights: AnalysisRegion[] = ['left-hamstring'];
type Preset = 'front' | 'back' | 'oblique';

export default function AnalysisAnatomy({ insights, active, onSelect, caption, highlightRegions = defaultHighlights }: {
  insights: AnatomyInsight[];
  active: number;
  onSelect: (index: number) => void;
  caption: string;
  highlightRegions?: AnalysisRegion[];
}) {
  const mount = useRef<HTMLDivElement>(null);
  const markers = useRef<(HTMLButtonElement | null)[]>([]);
  const view = useRef<((preset?: Preset, index?: number) => void) | null>(null);
  const current = useRef({ active, onSelect });
  current.current = { active, onSelect };
  const [preset, setPreset] = useState<Preset>('back');
  const [status, setStatus] = useState('Loading reference anatomy…');
  const [ready, setReady] = useState(false);

  useEffect(() => { view.current?.(undefined, active); }, [active]);
  useEffect(() => {
    const container = mount.current!;
    let cleanup: (() => void) | undefined;
    let disposed = false;
    setReady(false); setStatus('Loading reference anatomy…');
    const visibility = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      visibility.disconnect(); void initialise();
    }, { rootMargin: '250px' });
    visibility.observe(container);

    async function initialise() {
      let renderer: THREE.WebGLRenderer;
      try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
      catch { if (!disposed) setStatus('3D is unavailable on this device. The observations and source notes remain readable.'); return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      renderer.domElement.setAttribute('role', 'img');
      renderer.domElement.setAttribute('aria-label', `${caption}. ${insights.length ? 'Numbered pins link the anatomy to the observations.' : 'Neutral body: no location assumed.'} Reference anatomy, not a personal scan.`);
      container.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, .01, 20);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enablePan = false; controls.enableZoom = false;
      controls.minPolarAngle = Math.PI * .25; controls.maxPolarAngle = Math.PI * .75;
      scene.add(new THREE.HemisphereLight(0xffffff, 0x7e8978, 2.5));
      for (const [x, z] of [[-2, -4], [2, 4]]) {
        const light = new THREE.DirectionalLight(0xfff8ed, 2.7);
        light.position.set(x, 3, z); scene.add(light);
      }
      const materials = [
        new THREE.MeshStandardMaterial({ color: '#c7bdad', roughness: .77 }),
        new THREE.MeshStandardMaterial({ color: '#b6975c', roughness: .65, emissive: '#856124', emissiveIntensity: .1 }),
        new THREE.MeshStandardMaterial({ color: '#a77b31', roughness: .6, emissive: '#856124', emissiveIntensity: .2 }),
      ];
      const geometries: THREE.BufferGeometry[] = [];
      const meshes = new Map<AnalysisRegion, THREE.Mesh>();
      const bounds = new Map<AnalysisRegion, THREE.Box3>();
      const anchors: (THREE.Vector3 | null)[] = insights.map(insight => insight.position ? new THREE.Vector3(...insight.position) : null);
      // A translucent locator remains visible even when a joint's atlas landmark
      // lies beneath surface muscles. This is a location cue, not injured tissue.
      const haloGeometry = new THREE.RingGeometry(.035, .055, 32);
      geometries.push(haloGeometry);
      const haloMaterial = new THREE.MeshBasicMaterial({ color: '#bc9848', transparent: true, opacity: .42, depthTest: false, depthWrite: false, side: THREE.DoubleSide });
      const halos = anchors.map(() => { const halo = new THREE.Mesh(haloGeometry, haloMaterial); halo.renderOrder = 3; halo.visible = false; scene.add(halo); return halo; });
      const projected = new THREE.Vector3();
      let focus = new THREE.Vector3(0, .84, 0), frameHeight = 1.85, frameWidth = .9;
      let currentPreset: Preset = 'back';
      const render = () => {
        if (disposed) return;
        anchors.forEach((anchor, index) => {
          const marker = markers.current[index];
          if (!marker) return;
          if (!anchor) { marker.hidden = true; halos[index].visible = false; return; }
          projected.copy(anchor).project(camera);
          const back = insights[index].region ? regionPosterior(insights[index].region) : anchor.z < 0;
          const facing = back ? camera.position.z < controls.target.z : camera.position.z > controls.target.z;
          marker.hidden = !facing || projected.z > 1 || projected.z < -1 || Math.abs(projected.x) > .98 || Math.abs(projected.y) > .98;
          halos[index].visible = !marker.hidden && index === current.current.active;
          halos[index].position.copy(anchor); halos[index].quaternion.copy(camera.quaternion);
          marker.style.left = `${(projected.x + 1) * 50}%`;
          marker.style.top = `${(1 - projected.y) * 50}%`;
        });
        renderer.render(scene, camera);
      };
      const frame = () => {
        const distance = Math.max(frameHeight, frameWidth / Math.max(.2, camera.aspect)) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
        const back = currentPreset === 'back' || (currentPreset === 'oblique' && (insights[current.current.active]?.region ? regionPosterior(insights[current.current.active].region) : true));
        camera.position.set(focus.x + (currentPreset === 'oblique' ? distance * .45 : 0), focus.y + .025, focus.z + (back ? -1 : 1) * distance);
        controls.target.copy(focus); camera.lookAt(focus); controls.update(); render();
      };
      view.current = (nextPreset, index = current.current.active) => {
        const insight = insights[index], anchor = anchors[index];
        if (anchor) {
          focus = anchor.clone(); focus.z = 0;
          const box = insight.region && bounds.get(insight.region);
          frameHeight = box ? Math.max(.66, (box.max.y - box.min.y) * 1.55) : 1.1;
          frameWidth = Math.max(.44, frameHeight * .45);
        } else { focus = new THREE.Vector3(0, .84, 0); frameHeight = 1.85; frameWidth = .9; }
        currentPreset = nextPreset || (insight?.region ? regionPosterior(insight.region) ? 'back' : 'front' : insights.length ? 'back' : 'front');
        setPreset(currentPreset);
        for (const [region, mesh] of meshes) mesh.material = materials[region === insight?.region ? 2 : 1];
        frame();
      };
      controls.addEventListener('change', render);
      const resize = new ResizeObserver(() => {
        const { clientWidth: width, clientHeight: height } = container;
        camera.aspect = width / Math.max(1, height); camera.updateProjectionMatrix();
        renderer.setSize(width, height); frame();
      });
      resize.observe(container);
      const contextLost = (event: Event) => {
        event.preventDefault(); setReady(false);
        setStatus('The 3D view was interrupted. The written insights remain available; reload to restore the image.');
      };
      renderer.domElement.addEventListener('webglcontextlost', contextLost);
      cleanup = () => {
        controls.removeEventListener('change', render); controls.dispose(); resize.disconnect();
        renderer.domElement.removeEventListener('webglcontextlost', contextLost);
        geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose()); haloMaterial.dispose();
        renderer.dispose(); renderer.domElement.remove(); view.current = null;
      };
      try {
        const { atlas, buffer } = await loadAnatomy();
        if (disposed) return;
        const highlighted = new Set(highlightRegions);
        const groups = new Map<AnalysisRegion | null, THREE.BufferGeometry[]>();
        for (const part of atlas.parts) {
          const region = analysisMuscleRegion(part.name);
          if (region) {
            const box = new THREE.Box3(new THREE.Vector3(...part.bounds[0]), new THREE.Vector3(...part.bounds[1]));
            if (bounds.has(region)) bounds.get(region)!.union(box); else bounds.set(region, box);
          }
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(buffer, part.positions, part.vertexCount * 3), 3));
          geometry.setAttribute('normal', new THREE.BufferAttribute(new Int16Array(buffer, part.normals, part.vertexCount * 3), 3, true));
          geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(buffer, part.indices, part.indexCount), 1));
          const group = region && highlighted.has(region) ? region : null;
          const parts = groups.get(group) || []; parts.push(geometry); groups.set(group, parts);
        }
        for (const [region, parts] of groups) {
          const geometry = mergeGeometries(parts, false); parts.forEach(part => part.dispose());
          if (!geometry) throw new Error('The anatomy could not be assembled.');
          geometries.push(geometry);
          const mesh = new THREE.Mesh(geometry, materials[region ? 1 : 0]);
          scene.add(mesh); if (region) meshes.set(region, mesh);
        }
        insights.forEach((insight, index) => {
          if (!insight.region) return;
          const box = bounds.get(insight.region);
          if (box) anchors[index] = new THREE.Vector3(...regionAnchor(insight.region, [box.min.toArray(), box.max.toArray()] as Bounds));
        });
        view.current?.(undefined, current.current.active);
        setReady(true); setStatus('');
      } catch (error) {
        if (!disposed) setStatus(`${error instanceof Error ? error.message : 'The image is unavailable.'} All insights remain readable below.`);
      }
    }
    return () => { disposed = true; visibility.disconnect(); cleanup?.(); };
  }, [insights, caption, highlightRegions]);

  return <div className="analysis-anatomy">
    <div className="analysis-view-label"><Box size={13} /> ANATOMY STUDY <span>3D</span></div>
    <div className="analysis-canvas" ref={mount} />
    <div className="analysis-markers" hidden={!ready}>
      {insights.map((insight, index) => <button key={`${insight.label}-${index}`} ref={node => { markers.current[index] = node; }}
        className={`analysis-pin ${active === index ? 'selected' : ''}`}
        aria-label={`Insight ${index + 1}: ${insight.label}`} aria-pressed={active === index} onClick={() => onSelect(index)}>
        <span>{index + 1}</span><i /><b>{insight.label}</b>
      </button>)}
    </div>
    {status && <div className="analysis-image-status" role="status"><Box size={22} /><p>{status}</p></div>}
    <div className="analysis-view-controls">
      <div aria-label="Anatomy view">
        {(['front', 'back', 'oblique'] as const).map(value => <button key={value} disabled={!ready} aria-pressed={preset === value} onClick={() => view.current?.(value)}>{value === 'front' ? 'Front' : value === 'back' ? 'Back' : 'Oblique'}</button>)}
      </div>
      <button disabled={!ready} aria-label="Reset anatomy view" onClick={() => view.current?.(undefined, active)}><RotateCcw size={13} /></button>
    </div>
  </div>;
}
