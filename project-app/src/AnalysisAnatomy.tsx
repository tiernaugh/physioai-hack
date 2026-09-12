import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { Box, RotateCcw } from "lucide-react";
import type { AnatomyInsight } from "./agent-analysis";

type Atlas = {
  parts: { id: string; positions: number; normals: number; indices: number; vertexCount: number; indexCount: number }[];
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
const hamstrings = new Set(["FJ1395M", "FJ1444M", "FJ1435M", "FJ1436M"]);

export default function AnalysisAnatomy({ insights, active, onSelect, caption }: {
  insights: AnatomyInsight[];
  active: number;
  onSelect: (index: number) => void;
  caption: string;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const markers = useRef<(HTMLButtonElement | null)[]>([]);
  const view = useRef<((oblique: boolean) => void) | null>(null);
  const [oblique, setOblique] = useState(false);
  const [status, setStatus] = useState("Loading reference anatomy…");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = mount.current!;
    let cleanup: (() => void) | undefined;
    let disposed = false;
    const visibility = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      visibility.disconnect();
      void initialise();
    }, { rootMargin: "250px" });
    visibility.observe(container);

    async function initialise() {
      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        setStatus("3D is unavailable on this device. All three insights are readable beside the image.");
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      renderer.domElement.setAttribute("role", "img");
      renderer.domElement.setAttribute("aria-label", `${caption}. Three numbered pins link the anatomy to the agent’s insights. This is reference anatomy, not a personal scan.`);
      container.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 20);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enablePan = false;
      controls.enableZoom = false;
      // Keep the posterior surface in view so pins never imply a point on an
      // unseen anterior structure. Preset buttons also provide keyboard control.
      controls.minAzimuthAngle = Math.PI * 0.73;
      controls.maxAzimuthAngle = Math.PI * 1.27;
      controls.minPolarAngle = Math.PI * 0.39;
      controls.maxPolarAngle = Math.PI * 0.61;
      controls.target.set(0, 0.65, 0);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x7e8978, 2.5));
      const key = new THREE.DirectionalLight(0xfff8ed, 3.2);
      key.position.set(-2, 3, -4);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xe4edd7, 2);
      fill.position.set(3, 1, -1);
      scene.add(fill);
      const materials = [
        new THREE.MeshStandardMaterial({ color: "#c7bdad", roughness: 0.77 }),
        new THREE.MeshStandardMaterial({ color: "#a98545", roughness: 0.65, emissive: "#856124", emissiveIntensity: 0.12 }),
      ];
      const geometries: THREE.BufferGeometry[] = [];
      const anchors = insights.map((p) => new THREE.Vector3(...p.position));
      const projected = new THREE.Vector3();
      const render = () => {
        if (disposed) return;
        renderer.render(scene, camera);
        anchors.forEach((anchor, i) => {
          projected.copy(anchor).project(camera);
          const marker = markers.current[i];
          if (!marker) return;
          marker.style.left = `${(projected.x + 1) * 50}%`;
          marker.style.top = `${(1 - projected.y) * 50}%`;
        });
      };
      view.current = (angled) => {
        camera.position.set(angled ? 1.1 : 0, 0.72, angled ? -1.72 : -2.02);
        camera.lookAt(controls.target);
        controls.update();
        render();
      };
      view.current(false);
      controls.addEventListener("change", render);
      const resize = new ResizeObserver(() => {
        const { clientWidth: width, clientHeight: height } = container;
        camera.aspect = width / Math.max(1, height);
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        render();
      });
      resize.observe(container);
      const contextLost = (event: Event) => {
        event.preventDefault();
        setReady(false);
        setStatus("The 3D view was interrupted. The written insights remain available; reload to restore the image.");
      };
      renderer.domElement.addEventListener("webglcontextlost", contextLost);
      cleanup = () => {
        controls.removeEventListener("change", render);
        controls.dispose();
        resize.disconnect();
        renderer.domElement.removeEventListener("webglcontextlost", contextLost);
        geometries.forEach((g) => g.dispose());
        materials.forEach((m) => m.dispose());
        renderer.dispose();
        renderer.domElement.remove();
        view.current = null;
      };
      try {
        const { atlas, buffer } = await loadAnatomy();
        if (disposed) return;
        const groups: THREE.BufferGeometry[][] = [[], []];
        for (const part of atlas.parts) {
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(buffer, part.positions, part.vertexCount * 3), 3));
          geometry.setAttribute("normal", new THREE.BufferAttribute(new Int16Array(buffer, part.normals, part.vertexCount * 3), 3, true));
          geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(buffer, part.indices, part.indexCount), 1));
          groups[hamstrings.has(part.id) ? 1 : 0].push(geometry);
        }
        groups.forEach((parts, i) => {
          const geometry = mergeGeometries(parts, false);
          parts.forEach((g) => g.dispose());
          if (!geometry) throw new Error("The anatomy could not be assembled.");
          geometries.push(geometry);
          scene.add(new THREE.Mesh(geometry, materials[i]));
        });
        render();
        setReady(true);
        setStatus("");
      } catch (error) {
        if (!disposed) setStatus(`${error instanceof Error ? error.message : "The image is unavailable."} All insights remain readable below.`);
      }
    }
    return () => { disposed = true; visibility.disconnect(); cleanup?.(); };
  }, [insights, caption]);

  return (
    <div className="analysis-anatomy">
      <div className="analysis-view-label"><Box size={13} /> ANATOMY STUDY <span>3D</span></div>
      <div className="analysis-canvas" ref={mount} />
      <div className="analysis-markers" hidden={!ready}>
        {insights.map((insight, i) => (
          <button key={insight.label} ref={(node) => { markers.current[i] = node; }}
            className={`analysis-pin ${active === i ? "selected" : ""}`}
            aria-label={`Insight ${i + 1}: ${insight.label}`} aria-pressed={active === i}
            onClick={() => onSelect(i)}>
            <span>{i + 1}</span><i /><b>{insight.label}</b>
          </button>
        ))}
      </div>
      {status && <div className="analysis-image-status" role="status"><Box size={22} /><p>{status}</p></div>}
      <div className="analysis-view-controls">
        <div aria-label="Anatomy view">
          <button disabled={!ready} aria-pressed={!oblique} onClick={() => { view.current?.(false); setOblique(false); }}>Posterior</button>
          <button disabled={!ready} aria-pressed={oblique} onClick={() => { view.current?.(true); setOblique(true); }}>Oblique</button>
        </div>
        <button disabled={!ready} aria-label="Reset anatomy view" onClick={() => { view.current?.(false); setOblique(false); }}><RotateCcw size={13} /></button>
      </div>
    </div>
  );
}
