import { Suspense, useEffect, useMemo, useRef, useState, Component, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html, useProgress } from "@react-three/drei";
import * as THREE from "three";

export const MODEL_URLS = {
  hero: "https://cdn.jsdelivr.net/gh/Nissmo89/Supercar-Vault-3D@main/models/2014_koenigsegg_one-1.glb",
  heroFallback: "https://raw.githubusercontent.com/Nissmo89/Supercar-Vault-3D/main/models/2014_koenigsegg_one-1.glb",
  fallback: "https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/models/gltf/ferrari.glb",
};

const URL_ORDER = [MODEL_URLS.hero, MODEL_URLS.heroFallback, MODEL_URLS.fallback];

const ATTRIBUTION =
  "Model minh họa: Koenigsegg One:1 — Sketchfab/Nissmo89";

/** Heuristic: find paint-like materials in a GLTF scene */
function findPaintMaterials(scene: THREE.Object3D): THREE.MeshStandardMaterial[] {
  const found = new Map<string, THREE.MeshStandardMaterial>();
  const keywords = /paint|body|carro|exterior|chassis|shell/i;
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      const mat = m as THREE.MeshStandardMaterial;
      if (!mat || !("color" in mat)) continue;
      const name = (mat.name || mesh.name || "").toLowerCase();
      const looksPainty =
        keywords.test(name) ||
        (typeof mat.metalness === "number" && mat.metalness > 0.4 && typeof mat.roughness === "number" && mat.roughness < 0.6);
      const isGlass = mat.transparent && mat.opacity < 0.7;
      const isTire = name.includes("tire") || name.includes("tyre") || name.includes("wheel");
      if (looksPainty && !isGlass && !isTire && !found.has(mat.uuid)) {
        found.set(mat.uuid, mat);
      }
    }
  });
  return [...found.values()];
}

/** Smoothly lerps paint color toward target every frame */
function PaintLerp({ materials, targetHex }: { materials: THREE.MeshStandardMaterial[]; targetHex: string }) {
  const target = useMemo(() => new THREE.Color(targetHex), [targetHex]);
  useFrame((_, delta) => {
    const k = 1 - Math.exp(-delta * 6); // smooth exponential approach
    for (const m of materials) {
      m.color.lerp(target, k);
    }
  });
  return null;
}

function CarModel({
  url,
  paintHex,
  onReady,
}: {
  url: string;
  paintHex: string;
  onReady: (sphere: THREE.Sphere) => void;
}) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map((m) => m.clone())
          : (mesh.material as THREE.Material).clone();
      }
    });
    // normalize: center on origin, sit on floor, consistent size
    const box = new THREE.Box3().setFromObject(c);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = 5.6 / Math.max(size.x, size.y, size.z);
    c.scale.setScalar(scale);
    c.position.sub(center.clone().multiplyScalar(scale));
    c.position.y -= box.min.y * scale;
    return c;
  }, [scene]);

  const paints = useMemo(() => {
    const found = findPaintMaterials(cloned);
    // showroom finish: boost clearcoat/metalness once
    for (const m of found) {
      if ("metalness" in m) m.metalness = Math.max(m.metalness, 0.7);
      if ("roughness" in m) m.roughness = Math.min(m.roughness, 0.3);
      const pm = m as THREE.MeshPhysicalMaterial;
      if ("clearcoat" in pm) {
        pm.clearcoat = 1;
        pm.clearcoatRoughness = 0.06;
      }
      m.needsUpdate = true;
    }
    return found;
  }, [cloned]);

  // report bounding sphere for camera framing (after normalize)
  useEffect(() => {
    const sphere = new THREE.Box3().setFromObject(cloned).getBoundingSphere(new THREE.Sphere());
    onReady(sphere);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloned]);

  return (
    <group>
      <primitive object={cloned} />
      <PaintLerp materials={paints} targetHex={paintHex} />
    </group>
  );
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
        <p className="font-condensed text-xs uppercase tracking-[0.3em] text-gold">
          Đang đưa xe lên sàn... {Math.round(progress)}%
        </p>
      </div>
    </Html>
  );
}

/** Preset view directions (will be scaled by bounding sphere) */
const VIEW_DIRS: Record<string, THREE.Vector3> = {
  "3/4 trước": new THREE.Vector3(1, 0.38, 1).normalize(),
  "Hông": new THREE.Vector3(1, 0.18, 0.12).normalize(),
  "Đuôi": new THREE.Vector3(-1, 0.38, -1).normalize(),
  "Trên cao": new THREE.Vector3(0.25, 1, 0.35).normalize(),
};

/** Camera rig: keeps presets framed on the bounding sphere */
function CameraRig({
  controlsRef,
  sphere,
  view,
  viewTick,
}: {
  controlsRef: React.RefObject<React.ElementRef<typeof OrbitControls> | null>;
  sphere: THREE.Sphere | null;
  view: string;
  viewTick: number;
}) {
  const { camera, size } = useThree();

  const fitDistance = (radius: number) => {
    const vFov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * (size.width / size.height));
    const fitV = radius / Math.sin(vFov / 2);
    const fitH = radius / Math.sin(hFov / 2);
    return Math.max(fitV, fitH) * 1.12;
  };

  // initial fit when model loads
  useEffect(() => {
    if (!sphere || !controlsRef.current) return;
    const dir = VIEW_DIRS["3/4 trước"];
    const d = fitDistance(sphere.radius);
    camera.position.copy(sphere.center).addScaledVector(dir, d);
    controlsRef.current.target.copy(sphere.center);
    controlsRef.current.update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sphere]);

  // preset changes
  useEffect(() => {
    if (!sphere || !controlsRef.current || viewTick === 0) return;
    const dir = VIEW_DIRS[view] ?? VIEW_DIRS["3/4 trước"];
    const d = fitDistance(sphere.radius);
    camera.position.copy(sphere.center).addScaledVector(dir, d);
    controlsRef.current.target.copy(sphere.center);
    controlsRef.current.update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewTick]);

  return null;
}

export default function Car3DViewer({ paintHex, paintName }: { paintHex: string; paintName: string }) {
  const [url, setUrl] = useState(MODEL_URLS.hero);
  const [failed, setFailed] = useState(false);
  const [auto, setAuto] = useState(true);
  const [view, setView] = useState("3/4 trước");
  const [viewTick, setViewTick] = useState(0);
  const [sphere, setSphere] = useState<THREE.Sphere | null>(null);
  const controls = useRef<React.ElementRef<typeof OrbitControls> | null>(null);

  const handleError = () => {
    const idx = URL_ORDER.indexOf(url);
    if (idx < URL_ORDER.length - 1) {
      setSphere(null);
      setUrl(URL_ORDER[idx + 1]);
    } else {
      setFailed(true);
    }
  };

  const pickView = (v: string) => {
    setView(v);
    setViewTick((n) => n + 1);
  };

  return (
    <div className="relative h-[420px] w-full overflow-hidden border border-white/10 bg-[#080706] md:h-[560px]">
      {failed ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-ivory">Không tải được model 3D.</p>
          <p className="text-sm text-ash">Kiểm tra kết nối mạng rồi thử lại.</p>
          <button onClick={() => { setFailed(false); setSphere(null); setUrl(MODEL_URLS.hero); }} className="mt-2 border border-gold px-6 py-3 font-condensed text-xs uppercase tracking-[0.2em] text-gold">
            Thử lại
          </button>
        </div>
      ) : (
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [6, 2.5, 6], fov: 38 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => gl.setClearColor("#080706")}
        >
          <ambientLight intensity={0.55} />
          <directionalLight position={[5, 8, 5]} intensity={2.2} color="#fff5e0" />
          <directionalLight position={[-6, 4, -4]} intensity={1.1} color="#cfe0ff" />
          <directionalLight position={[0, 3, -7]} intensity={0.9} color="#ffffff" />
          <spotLight position={[0, 7, 0]} angle={0.5} penumbra={1} intensity={3} color="#ffe9c4" />
          <pointLight position={[-3, 1.5, 3]} intensity={0.8} color="#D4AF37" />
          <pointLight position={[3, 1, -3]} intensity={0.5} color="#ffffff" />

          <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
            <circleGeometry args={[9, 64]} />
            <meshStandardMaterial color="#0d0c0a" roughness={0.35} metalness={0.6} />
          </mesh>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, 0]}>
            <ringGeometry args={[3.4, 3.45, 64]} />
            <meshBasicMaterial color="#D4AF37" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>

          <Suspense fallback={<Loader />}>
            <ErrorBoundary onError={handleError}>
              <CarModel url={url} paintHex={paintHex} onReady={setSphere} />
            </ErrorBoundary>
          </Suspense>

          <CameraRig controlsRef={controls} sphere={sphere} view={view} viewTick={viewTick} />

          <OrbitControls
            ref={controls}
            makeDefault
            enableDamping
            dampingFactor={0.08}
            enablePan={false}
            minDistance={4}
            maxDistance={16}
            maxPolarAngle={Math.PI / 2 - 0.04}
            autoRotate={auto}
            autoRotateSpeed={1.1}
            onStart={() => setAuto(false)}
          />
        </Canvas>
      )}

      {/* overlay UI */}
      <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-3 border border-white/15 bg-obsidian/70 px-4 py-2.5 backdrop-blur">
        <span className="h-6 w-6 rounded-full border border-white/30 transition-colors duration-500" style={{ background: paintHex }} />
        <div className="pointer-events-auto">
          <p className="font-condensed text-[10px] uppercase tracking-[0.25em] text-ash">Minh họa sơn 3D</p>
          <p className="text-sm text-ivory">{paintName}</p>
        </div>
      </div>

      <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {Object.keys(VIEW_DIRS).map((v) => (
            <button
              key={v}
              onClick={() => pickView(v)}
              className={`border px-3.5 py-2 font-condensed text-[11px] uppercase tracking-[0.15em] backdrop-blur transition-colors ${
                view === v ? "border-gold bg-gold font-semibold text-obsidian" : "border-white/20 bg-obsidian/60 text-ivory/80 hover:border-gold/60"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <button
          onClick={() => setAuto(!auto)}
          className={`border px-4 py-2 font-condensed text-[11px] uppercase tracking-[0.15em] backdrop-blur transition-colors ${
            auto ? "border-gold bg-gold/15 text-gold" : "border-white/20 bg-obsidian/60 text-ivory/80"
          }`}
        >
          {auto ? "⏸ Dừng xoay" : "▶ Tự động xoay"}
        </button>
      </div>

      <p className="absolute bottom-5 right-5 hidden font-mono text-[10px] text-ash/50 xl:block">
        Kéo để xoay · Cuộn để zoom
      </p>
      <p className="pointer-events-none absolute right-5 top-5 hidden max-w-[240px] text-right font-mono text-[10px] leading-relaxed text-ash/40 md:block">
        {ATTRIBUTION}
      </p>
    </div>
  );
}

/** Minimal error boundary for the 3D model */
class ErrorBoundary extends Component<{ onError: () => void; children: ReactNode }, { dead: boolean }> {
  state = { dead: false };
  static getDerivedStateFromError() { return { dead: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.dead ? null : this.props.children; }
}

useGLTF.preload(MODEL_URLS.hero);
