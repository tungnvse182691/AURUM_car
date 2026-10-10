import { Suspense, useEffect, useMemo, useRef, useState, Component, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html, useProgress, MeshReflectorMaterial } from "@react-three/drei";
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

/** Heuristic: find wheel/rim materials */
function findWheelMaterials(scene: THREE.Object3D): THREE.MeshStandardMaterial[] {
  const found = new Map<string, THREE.MeshStandardMaterial>();
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const name = (mesh.name || "").toLowerCase();
    if (!/wheel|rim|tire|tyre/.test(name)) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      const mat = m as THREE.MeshStandardMaterial;
      if (!mat || !("color" in mat)) continue;
      const mn = (mat.name || "").toLowerCase();
      // rims only, not tires (tires are near-black already)
      if (/tire|tyre/.test(mn) || /tire|tyre/.test(name)) continue;
      if (!found.has(mat.uuid)) found.set(mat.uuid, mat);
    }
  });
  return [...found.values()];
}

/** Wheel finish presets */
const WHEEL_FINISH: Record<string, { color: string; metalness: number; roughness: number } | null> = {
  "w-std": null, // keep original
  "w-sport": { color: "#17181a", metalness: 0.6, roughness: 0.45 },
  "w-carbon": { color: "#0b0b0d", metalness: 0.85, roughness: 0.3 },
  "w-gold": { color: "#D4AF37", metalness: 0.9, roughness: 0.28 },
};

/** Smoothly lerps paint color toward target every frame */
function PaintLerp({ materials, targetHex }: { materials: THREE.MeshStandardMaterial[]; targetHex: string }) {
  const target = useMemo(() => new THREE.Color(targetHex), [targetHex]);
  useFrame((_, delta) => {
    const k = 1 - Math.exp(-delta * 6);
    for (const m of materials) m.color.lerp(target, k);
  });
  return null;
}

/** Smoothly lerps wheel finish toward target */
function WheelLerp({ materials, wheelId, originals }: { materials: THREE.MeshStandardMaterial[]; wheelId: string; originals: Map<string, THREE.Color> }) {
  const finish = WHEEL_FINISH[wheelId];
  const target = useMemo(() => (finish ? new THREE.Color(finish.color) : null), [finish]);
  useFrame((_, delta) => {
    const k = 1 - Math.exp(-delta * 6);
    for (const m of materials) {
      const t = target ?? originals.get(m.uuid);
      if (!t) continue;
      m.color.lerp(t, k);
      if (finish) {
        m.metalness += (finish.metalness - m.metalness) * k;
        m.roughness += (finish.roughness - m.roughness) * k;
      }
    }
  });
  return null;
}

function CarModel({
  url,
  paintHex,
  wheelId,
  onReady,
}: {
  url: string;
  paintHex: string;
  wheelId: string;
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

  const { wheels, wheelOriginals } = useMemo(() => {
    const found = findWheelMaterials(cloned);
    const originals = new Map<string, THREE.Color>();
    for (const m of found) originals.set(m.uuid, m.color.clone());
    return { wheels: found, wheelOriginals: originals };
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
      <WheelLerp materials={wheels} wheelId={wheelId} originals={wheelOriginals} />
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

/** Camera rig: keeps presets framed on the bounding sphere.
 *  Fits after layout stabilizes (rAF) and refits on resize. */
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
  const fitted = useRef(false);

  const frame = (dirKey: string) => {
    const c = controlsRef.current;
    if (!c || !sphere) return;
    const dir = VIEW_DIRS[dirKey] ?? VIEW_DIRS["3/4 trước"];
    const vFov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * (size.width / Math.max(1, size.height)));
    const radius = Math.max(0.5, sphere.radius);
    const dist = Math.max(radius / Math.sin(vFov / 2), radius / Math.sin(hFov / 2)) * 1.18;
    camera.position.copy(sphere.center).addScaledVector(dir, dist);
    c.target.copy(sphere.center);
    c.update();
  };

  // initial fit: wait a frame so canvas size is real, retry until size > 0
  useEffect(() => {
    if (!sphere || fitted.current) return;
    let raf = 0;
    let tries = 0;
    const attempt = () => {
      tries++;
      if (size.width > 10 && size.height > 10) {
        frame("3/4 trước");
        fitted.current = true;
      } else if (tries < 30) {
        raf = requestAnimationFrame(attempt);
      }
    };
    raf = requestAnimationFrame(attempt);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sphere, size.width, size.height]);

  // refit on resize (only if user hasn't moved camera manually — keep simple: refit)
  useEffect(() => {
    if (!sphere || !fitted.current) return;
    const t = setTimeout(() => frame(view), 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height]);

  // preset changes
  useEffect(() => {
    if (!sphere || viewTick === 0) return;
    frame(view);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewTick]);

  return null;
}

export default function Car3DViewer({ paintHex, paintName, wheelId, wheelName }: { paintHex: string; paintName: string; wheelId: string; wheelName: string }) {
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
          onCreated={({ gl }) => gl.setClearColor("#0a0908")}
        >
          {/* gradient backdrop */}
          <color attach="background" args={["#0a0908"]} />
          <fog attach="fog" args={["#0a0908", 14, 26]} />

          {/* showroom lighting */}
          <ambientLight intensity={0.5} />
          {/* key light */}
          <directionalLight position={[5, 8, 5]} intensity={2.4} color="#fff5e0" />
          {/* cool rim from behind-left for edge definition */}
          <directionalLight position={[-7, 5, -5]} intensity={1.6} color="#bcd2ff" />
          {/* warm fill from right */}
          <directionalLight position={[6, 3, -4]} intensity={0.8} color="#ffd9a0" />
          {/* top spotlight */}
          <spotLight position={[0, 8, 0]} angle={0.45} penumbra={0.9} intensity={3.2} color="#ffe9c4" />
          {/* under-glow to lift the car off the floor */}
          <pointLight position={[0, 0.35, 0]} intensity={0.9} distance={5} color="#D4AF37" />
          <pointLight position={[-3, 1.2, 3.5]} intensity={0.6} color="#D4AF37" />

          {/* mirror showroom floor — light gray so dark cars stay visible */}
          <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
            <circleGeometry args={[11, 64]} />
            <MeshReflectorMaterial
              blur={[200, 50]}
              resolution={1024}
              mixBlur={0.8}
              mixStrength={18}
              roughness={0.75}
              depthScale={1.1}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color="#3a3a40"
              metalness={0.4}
              mirror={0.5}
            />
          </mesh>
          {/* gold turntable ring */}
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0]}>
            <ringGeometry args={[3.5, 3.56, 72]} />
            <meshBasicMaterial color="#D4AF37" transparent opacity={0.55} side={THREE.DoubleSide} />
          </mesh>
          {/* soft radial glow behind car */}
          <mesh position={[0, 2.2, -6]}>
            <planeGeometry args={[16, 9]} />
            <meshBasicMaterial color="#1a1408" transparent opacity={0.55} />
          </mesh>

          <Suspense fallback={<Loader />}>
            <ErrorBoundary onError={handleError}>
              <CarModel url={url} paintHex={paintHex} wheelId={wheelId} onReady={setSphere} />
            </ErrorBoundary>
          </Suspense>

          <CameraRig controlsRef={controls} sphere={sphere} view={view} viewTick={viewTick} />

          <OrbitControls
            ref={controls}
            makeDefault
            enableDamping
            dampingFactor={0.08}
            enablePan={false}
            minDistance={4.5}
            maxDistance={13}
            maxPolarAngle={Math.PI / 2 - 0.06}
            minPolarAngle={Math.PI / 7}
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
          <p className="text-sm text-ivory">{paintName} · {wheelName}</p>
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
