import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html, useProgress, Bounds } from "@react-three/drei";
import * as THREE from "three";

export const MODEL_URLS = {
  hero: "https://cdn.jsdelivr.net/gh/Nissmo89/Supercar-Vault-3D@main/models/2014_koenigsegg_one-1.glb",
  heroFallback: "https://raw.githubusercontent.com/Nissmo89/Supercar-Vault-3D/main/models/2014_koenigsegg_one-1.glb",
  fallback: "https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/models/gltf/ferrari.glb",
};

const ATTRIBUTION: Record<string, string> = {
  hero: "Model: Koenigsegg One:1 — Sketchfab / Nissmo89 (kiểm tra license trước dùng thương mại)",
  fallback: "Model: Ferrari 458 — three.js example (CC-BY 4.0, vicent091036)",
};

const URL_ORDER = [MODEL_URLS.hero, MODEL_URLS.heroFallback, MODEL_URLS.fallback];

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
      // skip glass / dark trim / tires
      const isGlass = mat.transparent && mat.opacity < 0.7;
      const isTire = name.includes("tire") || name.includes("tyre") || name.includes("wheel");
      if (looksPainty && !isGlass && !isTire && !found.has(mat.uuid)) {
        found.set(mat.uuid, mat);
      }
    }
  });
  return [...found.values()];
}

function CarModel({ url, paintHex, onMaterials }: { url: string; paintHex: string; onMaterials: (m: THREE.MeshStandardMaterial[]) => void }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    // clone materials so we never mutate the drei cache
    c.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map((m) => m.clone())
          : (mesh.material as THREE.Material).clone();
      }
    });
    return c;
  }, [scene]);

  const paints = useMemo(() => findPaintMaterials(cloned), [cloned]);

  useEffect(() => {
    onMaterials(paints);
  }, [paints, onMaterials]);

  // apply paint color with a nice clearcoat-ish look
  useEffect(() => {
    const col = new THREE.Color(paintHex);
    paints.forEach((m) => {
      m.color.copy(col);
      if ("metalness" in m) m.metalness = Math.max(m.metalness, 0.65);
      if ("roughness" in m) m.roughness = Math.min(m.roughness, 0.32);
      // MeshPhysicalMaterial gets clearcoat for that wet showroom look
      const pm = m as THREE.MeshPhysicalMaterial;
      if ("clearcoat" in pm) {
        pm.clearcoat = 1;
        pm.clearcoatRoughness = 0.08;
      }
      m.needsUpdate = true;
    });
  }, [paints, paintHex]);

  // center + normalize scale
  const group = useRef<THREE.Group>(null);
  useEffect(() => {
    if (!group.current) return;
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 5.6 / maxDim;
    cloned.scale.setScalar(scale);
    cloned.position.sub(center.clone().multiplyScalar(scale));
    cloned.position.y -= box.min.y * scale - 0.02;
  }, [cloned]);

  return (
    <group ref={group}>
      <primitive object={cloned} />
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

/** Camera preset views */
const CAMERA_VIEWS: Record<string, [number, number, number]> = {
  "3/4 trước": [4.8, 2.0, 4.8],
  "Hông": [6.4, 1.4, 0.3],
  "Đuôi": [-4.6, 2.1, -4.8],
  "Trên cao": [0.7, 7.0, 1.1],
};

export default function Car3DViewer({ paintHex, paintName }: { paintHex: string; paintName: string }) {
  const [url, setUrl] = useState(MODEL_URLS.hero);
  const [failed, setFailed] = useState(false);
  const [auto, setAuto] = useState(true);
  const [view, setView] = useState("3/4 trước");
  const controls = useRef<React.ElementRef<typeof OrbitControls>>(null);
  const [, force] = useState(0);

  // try each URL in order until one loads
  const handleError = () => {
    const idx = URL_ORDER.indexOf(url);
    if (idx < URL_ORDER.length - 1) {
      setUrl(URL_ORDER[idx + 1]);
    } else {
      setFailed(true);
    }
  };

  useEffect(() => {
    // move camera to preset view
    const c = controls.current;
    if (c) {
      const [x, y, z] = CAMERA_VIEWS[view];
      c.object.position.set(x, y, z);
      c.target.set(0, 0.5, 0);
      c.update();
      force((n) => n + 1);
    }
  }, [view]);

  return (
    <div className="relative h-[420px] w-full overflow-hidden border border-white/10 bg-[#080706] md:h-[540px]">
      {failed ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-ivory">Không tải được model 3D.</p>
          <p className="text-sm text-ash">Kiểm tra kết nối mạng rồi thử lại.</p>
          <button onClick={() => { setFailed(false); setUrl(MODEL_URLS.hero); }} className="mt-2 border border-gold px-6 py-3 font-condensed text-xs uppercase tracking-[0.2em] text-gold">
            Thử lại
          </button>
        </div>
      ) : (
        <Canvas
          dpr={[1, 2]}
          camera={{ position: CAMERA_VIEWS["3/4 trước"], fov: 40 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => gl.setClearColor("#080706")}
        >
          {/* studio lighting — no external HDR needed */}
          <ambientLight intensity={0.55} />
          <directionalLight position={[5, 8, 5]} intensity={2.2} color="#fff5e0" />
          <directionalLight position={[-6, 4, -4]} intensity={1.1} color="#cfe0ff" />
          <directionalLight position={[0, 3, -7]} intensity={0.9} color="#ffffff" />
          <spotLight position={[0, 7, 0]} angle={0.5} penumbra={1} intensity={3} color="#ffe9c4" />
          <pointLight position={[-3, 1.5, 3]} intensity={0.8} color="#D4AF37" />
          <pointLight position={[3, 1, -3]} intensity={0.5} color="#ffffff" />

          {/* showroom floor */}
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
              <Bounds fit clip observe margin={1.15}>
                <CarModel url={url} paintHex={paintHex} onMaterials={() => {}} />
              </Bounds>
            </ErrorBoundary>
          </Suspense>

          <OrbitControls
            ref={controls}
            makeDefault
            enableDamping
            dampingFactor={0.08}
            enablePan={false}
            minDistance={3.5}
            maxDistance={12}
            maxPolarAngle={Math.PI / 2 - 0.04}
            target={[0, 0.5, 0]}
            autoRotate={auto}
            autoRotateSpeed={1.2}
            onStart={() => setAuto(false)}
          />
        </Canvas>
      )}

      {/* overlay UI */}
      <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-3 border border-white/15 bg-obsidian/70 px-4 py-2.5 backdrop-blur">
        <span className="h-6 w-6 rounded-full border border-white/30" style={{ background: paintHex }} />
        <div className="pointer-events-auto">
          <p className="font-condensed text-[10px] uppercase tracking-[0.25em] text-ash">Sơn 3D</p>
          <p className="text-sm text-ivory">{paintName}</p>
        </div>
      </div>

      <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {Object.keys(CAMERA_VIEWS).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
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

      <p className="absolute bottom-5 right-5 hidden font-mono text-[10px] text-ash/50 md:block">
        Kéo để xoay · Cuộn để zoom
      </p>
      <p className="pointer-events-none absolute right-5 top-5 max-w-[220px] text-right font-mono text-[10px] leading-relaxed text-ash/40">
        {url === MODEL_URLS.fallback ? ATTRIBUTION.fallback : ATTRIBUTION.hero}
      </p>
    </div>
  );
}

/** Minimal error boundary for the 3D model */
import { Component, type ReactNode } from "react";
class ErrorBoundary extends Component<{ onError: () => void; children: ReactNode }, { dead: boolean }> {
  state = { dead: false };
  static getDerivedStateFromError() { return { dead: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.dead ? null : this.props.children; }
}

// preload the hero model in the background
useGLTF.preload(MODEL_URLS.hero);
