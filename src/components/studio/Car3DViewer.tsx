import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Html, useProgress, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import ProceduralCarFamily, { STYLE_SPHERE, type BodyStyle } from "./ProceduralCarFamily";

const VIEW_DIRS: Record<string, THREE.Vector3> = {
  "3/4 trước": new THREE.Vector3(1, 0.42, 1).normalize(),
  "Hông": new THREE.Vector3(1.35, 0.28, 0).normalize(),
  "Đuôi": new THREE.Vector3(-1.15, 0.45, -0.55).normalize(),
  "Trên cao": new THREE.Vector3(0.25, 1.5, 0.25).normalize(),
};

/** Camera rig: presets framed on the per-style bounding sphere */

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
        <p className="font-condensed text-xs uppercase tracking-[0.3em] text-ash">
          Đang dựng xưởng 3D… {Math.round(progress)}%
        </p>
      </div>
    </Html>
  );
}

/** Camera rig: presets framed on the per-style bounding sphere */
function CameraRig({
  controlsRef,
  bodyStyle,
  view,
  viewTick,
}: {
  controlsRef: React.RefObject<React.ElementRef<typeof OrbitControls> | null>;
  bodyStyle: BodyStyle;
  view: string;
  viewTick: number;
}) {
  const { camera, size } = useThree();
  const fitted = useRef(false);
  const sphere = STYLE_SPHERE[bodyStyle];

  const frame = (dirKey: string) => {
    const c = controlsRef.current;
    if (!c) return;
    const dir = VIEW_DIRS[dirKey] ?? VIEW_DIRS["3/4 trước"];
    const vFov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * (size.width / Math.max(1, size.height)));
    const radius = sphere.radius;
    const dist = Math.max(radius / Math.sin(vFov / 2), radius / Math.sin(hFov / 2)) * 1.05;
    camera.position.copy(sphere.center).addScaledVector(dir, dist);
    c.target.copy(sphere.center);
    c.update();
  };

  useEffect(() => {
    if (fitted.current) return;
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
  }, [size.width, size.height]);

  useEffect(() => {
    if (!fitted.current) return;
    const t = setTimeout(() => frame(view), 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height]);

  useEffect(() => {
    if (viewTick === 0) return;
    frame(view);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewTick]);

  // refit when car model changes
  useEffect(() => {
    if (!fitted.current) return;
    frame(view);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bodyStyle]);

  return null;
}

export default function Car3DViewer({
  bodyStyle,
  paintHex,
  paintName,
  wheelId,
  wheelName,
}: {
  bodyStyle: BodyStyle;
  paintHex: string;
  paintName: string;
  wheelId: string;
  wheelName: string;
}) {
  const [view, setView] = useState("3/4 trước");
  const [viewTick, setViewTick] = useState(0);
  const [auto, setAuto] = useState(true);
  const controls = useRef<React.ElementRef<typeof OrbitControls>>(null);

  const pickView = (v: string) => {
    setView(v);
    setViewTick((t) => t + 1);
    setAuto(false);
  };

  return (
    <div className="relative h-[520px] w-full overflow-hidden border border-white/10 bg-[#0a0908] md:h-[560px]">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [6, 2.5, 6], fov: 38 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        shadows
      >
        <color attach="background" args={["#0a0908"]} />
        <fog attach="fog" args={["#0a0908", 15, 30]} />

        {/* showroom lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={2.4} color="#fff5e0" castShadow />
        <directionalLight position={[-7, 5, -5]} intensity={1.6} color="#bcd2ff" />
        <directionalLight position={[6, 3, -4]} intensity={0.8} color="#ffd9a0" />
        <spotLight position={[0, 8, 0]} angle={0.45} penumbra={0.9} intensity={3.2} color="#ffe9c4" />
        <pointLight position={[0, 0.35, 0]} intensity={0.9} distance={5} color="#D4AF37" />
        <pointLight position={[-3, 1.2, 3.5]} intensity={0.6} color="#D4AF37" />

        {/* mirror showroom floor */}
        <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
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

        <Suspense fallback={<Loader />}>
          <ProceduralCarFamily bodyStyle={bodyStyle} paintHex={paintHex} wheelId={wheelId} />
        </Suspense>

        <CameraRig controlsRef={controls} bodyStyle={bodyStyle} view={view} viewTick={viewTick} />

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

      {/* overlay UI */}
      <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-3 border border-white/15 bg-obsidian/70 px-4 py-2.5 backdrop-blur">
        <span
          className="h-6 w-6 rounded-full border border-white/30 transition-colors duration-500"
          style={{ background: paintHex }}
        />
        <div>
          <p className="font-condensed text-[10px] uppercase tracking-[0.25em] text-ash">
            Concept 3D AURUM
          </p>
          <p className="text-sm text-ivory">
            {paintName} · {wheelName}
          </p>
        </div>
      </div>
      <p className="pointer-events-none absolute right-5 top-5 hidden text-right font-mono text-[10px] leading-relaxed text-ash/60 md:block">
        Concept 3D do AURUM dựng
        <br />
        minh họa màu sơn & mâm xe
      </p>

      {/* camera presets */}
      <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
        {Object.keys(VIEW_DIRS).map((v) => (
          <button
            key={v}
            onClick={() => pickView(v)}
            className={`border px-4 py-2 font-condensed text-xs uppercase tracking-[0.2em] transition ${
              view === v
                ? "border-gold bg-gold text-obsidian"
                : "border-white/20 bg-obsidian/70 text-ivory backdrop-blur hover:border-gold/60"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* auto-rotate + hint */}
      <div className="absolute bottom-5 right-5 flex items-center gap-3">
        <p className="hidden font-mono text-[10px] text-ash/70 lg:block">Kéo để xoay · Cuộn để zoom</p>
        <button
          onClick={() => setAuto((a) => !a)}
          className={`border px-4 py-2 font-condensed text-xs uppercase tracking-[0.2em] transition ${
            auto ? "border-gold bg-gold/15 text-gold" : "border-white/20 bg-obsidian/70 text-ivory backdrop-blur"
          }`}
        >
          {auto ? "⏸ Dừng xoay" : "▶ Tự động xoay"}
        </button>
      </div>
    </div>
  );
}
