import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  Activity,
  Box,
  Focus,
  Minus,
  Move,
  Plus,
  RotateCcw,
} from "lucide-react";
import type { RegionId } from "./data";

type AtlasPart = {
  id: string;
  name: string;
  positions: number;
  normals: number;
  indices: number;
  vertexCount: number;
  indexCount: number;
};

type Atlas = {
  version: string;
  parts: AtlasPart[];
  chunks: { url: string; bytes: number }[];
};

type ViewerApi = {
  turn: (back: boolean) => void;
  zoom: (direction: number) => void;
  reset: () => void;
};

type Props = {
  selected: RegionId;
  onSelect: (id: RegionId) => void;
  overlay: boolean;
  onOverlay: () => void;
};

type RecoveryStage = {
  month: number;
  phase: string;
  status: string;
  injury: number;
  exercises: [string, string];
};

const LEFT_HAMSTRING_IDS = new Set([
  "FJ1395M",
  "FJ1444M",
  "FJ1435M",
  "FJ1436M",
]);

const recoveryStages: RecoveryStage[] = [
  {
    month: 0,
    phase: "Protect & settle",
    status: "High irritation",
    injury: 92,
    exercises: ["Heel-dig isometric · 5 × 20 sec", "Gentle range · 2 × 10"],
  },
  {
    month: 1,
    phase: "Restore motion",
    status: "Early loading",
    injury: 76,
    exercises: ["Double-leg bridge · 3 × 8", "Prone curl · 3 × 10"],
  },
  {
    month: 2,
    phase: "Build capacity",
    status: "Load tolerated",
    injury: 59,
    exercises: ["Bridge walkout · 3 × 6", "Hip hinge · 3 × 8"],
  },
  {
    month: 3,
    phase: "Strength & control",
    status: "Mid recovery",
    injury: 43,
    exercises: ["Slider curl · 3 × 8", "Split-stance RDL · 3 × 8"],
  },
  {
    month: 4,
    phase: "Eccentric strength",
    status: "Strong progress",
    injury: 27,
    exercises: ["Assisted Nordic · 3 × 5", "Single-leg RDL · 3 × 8"],
  },
  {
    month: 5,
    phase: "Reintroduce speed",
    status: "Return preparation",
    injury: 13,
    exercises: ["Progressive strides · 6 × 60 m", "Low pogo hops · 3 × 20"],
  },
  {
    month: 6,
    phase: "Return & maintain",
    status: "Recovered",
    injury: 4,
    exercises: ["Sprint exposure · 4 × 40 m", "Nordic hamstring · 2 × 6"],
  },
];

async function decodeGzip(url: string, expectedBytes: number) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("The muscle model could not be loaded.");
  const payload = await response.arrayBuffer();
  const signature = new Uint8Array(payload, 0, Math.min(2, payload.byteLength));
  const compressed = signature[0] === 0x1f && signature[1] === 0x8b;
  if (compressed && typeof DecompressionStream === "undefined") {
    throw new Error("This browser cannot unpack the muscle model.");
  }
  const buffer = compressed
    ? await new Response(
        new Blob([payload]).stream().pipeThrough(new DecompressionStream("gzip")),
      ).arrayBuffer()
    : payload;
  if (buffer.byteLength !== expectedBytes) {
    throw new Error("The muscle model was incomplete. Please reload.");
  }
  return buffer;
}

const RECOVERY_RED = new THREE.Color("#c83f36");
const RECOVERY_AMBER = new THREE.Color("#d99a45");
const RECOVERY_GREEN = new THREE.Color("#4f9a68");

function setRecoveryColour(target: THREE.Color, progress: number) {
  return progress < 0.5
    ? target.copy(RECOVERY_RED).lerp(RECOVERY_AMBER, progress * 2)
    : target.copy(RECOVERY_AMBER).lerp(RECOVERY_GREEN, (progress - 0.5) * 2);
}

export default function BodyViewer({
  selected,
  onSelect,
  overlay,
  onOverlay,
}: Props) {
  const mount = useRef<HTMLDivElement>(null);
  const api = useRef<ViewerApi | null>(null);
  const current = useRef({ selected, overlay, month: 0, onSelect });
  const [month, setMonth] = useState(0);
  const [back, setBack] = useState(true);
  const [failed, setFailed] = useState("");
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(false);
  const stage = recoveryStages[month];
  const recovery = 100 - stage.injury;
  current.current = { selected, overlay, month, onSelect };

  useEffect(() => {
    const container = mount.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      setFailed("This browser could not start the 3D viewer.");
      return;
    }

    let disposed = false;
    let frame = 0;
    let targetMesh: THREE.Mesh | null = null;
    const disposableGeometries: THREE.BufferGeometry[] = [];
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.domElement.setAttribute(
      "aria-label",
      "Interactive posterior muscle anatomy showing a left hamstring recovery over six months.",
    );
    renderer.domElement.setAttribute("role", "img");
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100);
    camera.position.set(0, 0.9, -3.45);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 2.25;
    controls.maxDistance = 6.5;
    controls.target.set(0, 0.88, 0);
    controls.maxPolarAngle = Math.PI * 0.9;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x70806c, 2.2));
    const key = new THREE.DirectionalLight(0xfff6ea, 3.4);
    key.position.set(-3, 5, -4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xd9eee4, 2.5);
    rim.position.set(4, 2, 3);
    scene.add(rim);

    const baseMaterial = new THREE.MeshStandardMaterial({
      color: "#c7b8a8",
      roughness: 0.7,
      metalness: 0.01,
    });
    const targetMaterial = new THREE.MeshStandardMaterial({
      color: "#c83f36",
      emissive: "#5a1712",
      emissiveIntensity: 0.22,
      roughness: 0.54,
    });
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let down = { x: 0, y: 0 };

    async function loadModel() {
      try {
        const atlasResponse = await fetch("/models/muscle-atlas/atlas.json");
        if (!atlasResponse.ok) throw new Error("The muscle catalogue could not be loaded.");
        const atlas = (await atlasResponse.json()) as Atlas;
        const chunk = atlas.chunks[0];
        const buffer = await decodeGzip(chunk.url, chunk.bytes);
        if (disposed) return;

        const base: THREE.BufferGeometry[] = [];
        const target: THREE.BufferGeometry[] = [];
        for (const part of atlas.parts) {
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
              new Float32Array(buffer, part.positions, part.vertexCount * 3),
              3,
            ),
          );
          geometry.setAttribute(
            "normal",
            new THREE.BufferAttribute(
              new Int16Array(buffer, part.normals, part.vertexCount * 3),
              3,
              true,
            ),
          );
          geometry.setIndex(
            new THREE.BufferAttribute(
              new Uint32Array(buffer, part.indices, part.indexCount),
              1,
            ),
          );
          (LEFT_HAMSTRING_IDS.has(part.id) ? target : base).push(geometry);
        }

        const baseGeometry = mergeGeometries(base, false);
        const targetGeometry = mergeGeometries(target, false);
        if (!baseGeometry || !targetGeometry) {
          throw new Error("The muscle geometry could not be assembled.");
        }
        base.forEach((geometry) => geometry.dispose());
        target.forEach((geometry) => geometry.dispose());
        disposableGeometries.push(baseGeometry, targetGeometry);
        scene.add(new THREE.Mesh(baseGeometry, baseMaterial));
        targetMesh = new THREE.Mesh(targetGeometry, targetMaterial);
        targetMesh.renderOrder = 2;
        scene.add(targetMesh);
        setLoading(false);
      } catch (error) {
        if (!disposed) {
          setFailed(
            error instanceof Error ? error.message : "The muscle model could not be loaded.",
          );
          setLoading(false);
        }
      }
    }
    void loadModel();

    function point(event: PointerEvent) {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      return targetMesh ? raycaster.intersectObject(targetMesh, false).length > 0 : false;
    }

    const onDown = (event: PointerEvent) => {
      down = { x: event.clientX, y: event.clientY };
    };
    const onUp = (event: PointerEvent) => {
      if (Math.hypot(down.x - event.clientX, down.y - event.clientY) < 6 && point(event)) {
        current.current.onSelect("left-hamstring");
      }
    };
    const onMove = (event: PointerEvent) => {
      if (event.buttons) return;
      const hit = point(event);
      renderer.domElement.style.cursor = hit ? "pointer" : "grab";
      setHovered(hit);
    };
    const onLeave = () => setHovered(false);
    const contextLost = (event: Event) => {
      event.preventDefault();
      setFailed("The 3D session was paused by this device. Reload to continue.");
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerleave", onLeave);
    renderer.domElement.addEventListener("webglcontextlost", contextLost);

    const resize = () => {
      camera.aspect = container.clientWidth / Math.max(1, container.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    api.current = {
      turn: (isBack) => {
        const distance = camera.position.distanceTo(controls.target);
        camera.position.set(0, 0.9, isBack ? -distance : distance);
        camera.lookAt(controls.target);
        controls.update();
      },
      zoom: (direction) => {
        const offset = camera.position.clone().sub(controls.target);
        offset.setLength(
          THREE.MathUtils.clamp(
            offset.length() * (direction > 0 ? 0.84 : 1.16),
            controls.minDistance,
            controls.maxDistance,
          ),
        );
        camera.position.copy(controls.target).add(offset);
        controls.update();
      },
      reset: () => {
        camera.position.set(0, 0.9, -3.45);
        controls.target.set(0, 0.88, 0);
        camera.lookAt(controls.target);
        controls.update();
      },
    };

    const colour = new THREE.Color();
    const desiredColour = new THREE.Color();
    const neutral = new THREE.Color("#c7b8a8");
    const animate = () => {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      const state = current.current;
      const progress = state.month / 6;
      const desired = state.overlay
        ? setRecoveryColour(desiredColour, progress)
        : neutral;
      colour.copy(targetMaterial.color).lerp(desired, 0.09);
      targetMaterial.color.copy(colour);
      targetMaterial.emissive.copy(desired).multiplyScalar(state.overlay ? 0.25 : 0);
      targetMaterial.emissiveIntensity = state.overlay
        ? 0.12 + Math.abs(0.5 - progress) * 0.26
        : 0;
      controls.update();
      setBack(camera.position.z < 0);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      api.current = null;
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerleave", onLeave);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      disposableGeometries.forEach((geometry) => geometry.dispose());
      baseMaterial.dispose();
      targetMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <section className="body-viewer recovery-viewer" aria-label="Hamstring recovery explorer">
      <div className="viewer-top">
        <div className="view-title">
          <Box size={17} />
          <span>Muscle recovery</span>
          <span className="version-tag">3D</span>
        </div>
        <span className={`recovery-status month-${month}`}>
          Month {month} · {stage.status}
        </span>
      </div>

      <div className="body-canvas" ref={mount} />
      <div className="view-watermark">
        RECOVERY
        <br />
        OVER TIME.
      </div>
      <div className="viewer-side-label">
        <span>{back ? "POSTERIOR" : "ANTERIOR"}</span>
        <i />
        <span>LEFT HAMSTRING</span>
      </div>

      {loading && !failed && (
        <div className="atlas-loading" role="status">
          <Activity size={18} /> Loading muscle anatomy…
        </div>
      )}
      {failed && (
        <div className="viewer-fallback" role="alert">
          <Box size={32} />
          <strong>Muscle view unavailable</strong>
          <p>{failed}</p>
        </div>
      )}

      <div className="orientation" aria-hidden="true">
        <span>{back ? "L" : "R"}</span>
        <span>{back ? "R" : "L"}</span>
      </div>
      {hovered && <div className="hover-label">Left hamstring group</div>}

      <div className="viewer-tools">
        <button title="Zoom in" aria-label="Zoom in" onClick={() => api.current?.zoom(1)}>
          <Plus size={18} />
        </button>
        <button title="Zoom out" aria-label="Zoom out" onClick={() => api.current?.zoom(-1)}>
          <Minus size={18} />
        </button>
        <div />
        <button
          title="Reset posterior view"
          aria-label="Reset posterior view"
          onClick={() => {
            api.current?.reset();
            setBack(true);
          }}
        >
          <Focus size={18} />
        </button>
      </div>

      <div className="recovery-panel">
        <div className="recovery-panel-head">
          <div>
            <span>MONTH {month} OF 6</span>
            <strong>{stage.phase}</strong>
          </div>
          <div
            className="recovery-scores"
            aria-label={`${stage.injury}% injury intensity and ${recovery}% recovery`}
          >
            <span className="injury-score">{stage.injury}% injury</span>
            <span className="recovered-score">{recovery}% recovered</span>
          </div>
        </div>
        <label className="sr-only" htmlFor="recovery-month">
          Recovery month
        </label>
        <input
          id="recovery-month"
          className="recovery-range"
          type="range"
          min="0"
          max="6"
          step="1"
          value={month}
          style={{ "--recovery-progress": `${(month / 6) * 100}%` } as CSSProperties}
          onChange={(event) => {
            setMonth(Number(event.target.value));
            onSelect("left-hamstring");
          }}
        />
        <div className="month-labels" aria-hidden="true">
          {recoveryStages.map((item) => (
            <span key={item.month}>{item.month}</span>
          ))}
        </div>
        <div className="stage-exercises">
          {stage.exercises.map((exercise) => (
            <span key={exercise}>{exercise}</span>
          ))}
        </div>
        <div className="recovery-panel-foot">
          <div className="segmented view-rotation">
            <button
              className={back ? "active" : ""}
              onClick={() => {
                setBack(true);
                api.current?.turn(true);
              }}
            >
              Back
            </button>
            <button
              className={!back ? "active" : ""}
              onClick={() => {
                setBack(false);
                api.current?.turn(false);
              }}
            >
              Front
            </button>
            <button
              title="Turn model"
              aria-label="Turn model"
              onClick={() => {
                api.current?.turn(!back);
                setBack(!back);
              }}
            >
              <RotateCcw size={14} />
            </button>
          </div>
          <span className="drag-hint">
            <Move size={13} /> Drag to rotate
          </span>
          <button
            className={`overlay-toggle ${overlay ? "on" : ""}`}
            onClick={onOverlay}
            aria-pressed={overlay}
          >
            Recovery colour
          </button>
        </div>
        <small>Illustrative timeline only · rehabilitation should be individually assessed.</small>
      </div>
    </section>
  );
}
