import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * ProceduralCarFamily — 5 mainstream body styles built from Three.js primitives.
 * 100% license-clean (built from scratch). Each style has correct proportions.
 * All sit on y=0, centered at origin. Paint + wheels fully customizable.
 */

export type BodyStyle = "sedan" | "suv" | "hatchback" | "pickup" | "mpv";

const WHEEL_STYLE: Record<string, { rim: string; metalness: number; roughness: number; spokes: number }> = {
  "w-std": { rim: "#c8ccd2", metalness: 0.9, roughness: 0.32, spokes: 5 },
  "w-sport": { rim: "#17181a", metalness: 0.6, roughness: 0.45, spokes: 5 },
  "w-carbon": { rim: "#0b0b0d", metalness: 0.85, roughness: 0.3, spokes: 7 },
  "w-gold": { rim: "#D4AF37", metalness: 0.95, roughness: 0.25, spokes: 5 },
};

/* ---------------------------------- wheels ---------------------------------- */

function Wheel({
  position,
  rimColor,
  metalness,
  roughness,
  spokes,
  radius = 0.34,
  width = 0.26,
}: {
  position: [number, number, number];
  rimColor: string;
  metalness: number;
  roughness: number;
  spokes: number;
  radius?: number;
  width?: number;
}) {
  const rim = useRef<THREE.Group>(null);
  const tireGeo = useMemo(() => new THREE.CylinderGeometry(radius, radius, width, 32), [radius, width]);
  const rimGeo = useMemo(() => new THREE.CylinderGeometry(radius * 0.62, radius * 0.62, width + 0.01, 20), [radius, width]);
  const spokeGeo = useMemo(() => new THREE.BoxGeometry(0.05, radius * 1.1, width + 0.02), [radius, width]);
  const target = useMemo(() => new THREE.Color(rimColor), [rimColor]);

  useFrame((_, delta) => {
    if (!rim.current) return;
    const k = 1 - Math.exp(-delta * 6);
    rim.current.children.forEach((child) => {
      const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      if (m && m.userData.isRim) {
        m.color.lerp(target, k);
        m.metalness += (metalness - m.metalness) * k;
        m.roughness += (roughness - m.roughness) * k;
      }
    });
  });

  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <mesh geometry={tireGeo}>
        <meshStandardMaterial color="#0c0c0d" roughness={0.92} metalness={0.05} />
      </mesh>
      <group ref={rim}>
        <mesh geometry={rimGeo}>
          <meshStandardMaterial color={rimColor} metalness={metalness} roughness={roughness} userData={{ isRim: true }} />
        </mesh>
        {Array.from({ length: spokes }).map((_, i) => (
          <mesh key={i} geometry={spokeGeo} rotation={[0, 0, (i / spokes) * Math.PI * 2]}>
            <meshStandardMaterial color={rimColor} metalness={metalness} roughness={roughness} userData={{ isRim: true }} />
          </mesh>
        ))}
        <mesh position={[0.14, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 0.02, 16]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

/* -------------------------------- body profiles ------------------------------ */
// All profiles: x = length (front +), y = height. Front at +x.

function sedanProfile(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(2.25, 0.12);
  s.lineTo(2.25, 0.42);
  s.quadraticCurveTo(2.22, 0.52, 2.0, 0.55);
  s.quadraticCurveTo(1.6, 0.6, 1.0, 0.6);
  s.lineTo(0.6, 0.62);
  s.quadraticCurveTo(0.3, 0.64, 0.15, 0.78);
  s.lineTo(-0.6, 0.78);
  s.quadraticCurveTo(-1.2, 0.76, -1.6, 0.68);
  s.quadraticCurveTo(-2.0, 0.6, -2.25, 0.58);
  s.lineTo(-2.28, 0.4);
  s.lineTo(-2.28, 0.12);
  s.lineTo(-1.8, 0.1);
  s.absarc(-1.4, 0.34, 0.4, 0, Math.PI, false);
  s.lineTo(1.0, 0.1);
  s.absarc(1.4, 0.34, 0.4, Math.PI, 0, false);
  s.lineTo(2.25, 0.12);
  return s;
}

function suvProfile(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(2.2, 0.14);
  s.lineTo(2.2, 0.55);
  s.quadraticCurveTo(2.18, 0.68, 1.95, 0.7);
  s.lineTo(1.0, 0.72);
  s.lineTo(0.5, 0.74);
  s.quadraticCurveTo(0.2, 0.76, 0.05, 0.92);
  s.lineTo(-0.7, 0.92);
  s.quadraticCurveTo(-1.3, 0.9, -1.7, 0.84);
  s.lineTo(-2.15, 0.8);
  s.lineTo(-2.2, 0.5);
  s.lineTo(-2.2, 0.14);
  s.lineTo(-1.8, 0.12);
  s.absarc(-1.4, 0.36, 0.42, 0, Math.PI, false);
  s.lineTo(1.0, 0.12);
  s.absarc(1.4, 0.36, 0.42, Math.PI, 0, false);
  s.lineTo(2.2, 0.14);
  return s;
}

function hatchbackProfile(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(2.05, 0.12);
  s.lineTo(2.05, 0.42);
  s.quadraticCurveTo(2.02, 0.52, 1.8, 0.55);
  s.quadraticCurveTo(1.4, 0.6, 0.9, 0.6);
  s.lineTo(0.5, 0.62);
  s.quadraticCurveTo(0.2, 0.64, 0.05, 0.78);
  s.lineTo(-0.5, 0.8);
  s.quadraticCurveTo(-1.0, 0.78, -1.35, 0.66);
  s.quadraticCurveTo(-1.7, 0.56, -1.95, 0.54);
  s.lineTo(-1.98, 0.36);
  s.lineTo(-1.98, 0.12);
  s.lineTo(-1.6, 0.1);
  s.absarc(-1.25, 0.34, 0.4, 0, Math.PI, false);
  s.lineTo(0.9, 0.1);
  s.absarc(1.25, 0.34, 0.4, Math.PI, 0, false);
  s.lineTo(2.05, 0.12);
  return s;
}

function pickupProfile(): THREE.Shape {
  const s = new THREE.Shape();
  // cab + hood
  s.moveTo(2.3, 0.14);
  s.lineTo(2.3, 0.55);
  s.quadraticCurveTo(2.28, 0.66, 2.05, 0.68);
  s.lineTo(1.2, 0.7);
  s.lineTo(0.8, 0.72);
  s.quadraticCurveTo(0.5, 0.74, 0.35, 0.95);
  s.lineTo(-0.2, 0.98);
  s.lineTo(-0.5, 0.96);
  s.lineTo(-0.55, 0.72); // back of cab
  // truck bed
  s.lineTo(-2.3, 0.72);
  s.lineTo(-2.35, 0.5);
  s.lineTo(-2.35, 0.14);
  s.lineTo(-1.9, 0.12);
  s.absarc(-1.5, 0.36, 0.42, 0, Math.PI, false);
  s.lineTo(1.1, 0.12);
  s.absarc(1.5, 0.36, 0.42, Math.PI, 0, false);
  s.lineTo(2.3, 0.14);
  return s;
}

function mpvProfile(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(2.25, 0.14);
  s.lineTo(2.25, 0.5);
  s.quadraticCurveTo(2.23, 0.62, 2.0, 0.64);
  s.lineTo(1.2, 0.66);
  s.quadraticCurveTo(0.8, 0.68, 0.6, 0.9);
  s.lineTo(-0.8, 0.95);
  s.quadraticCurveTo(-1.5, 0.93, -1.9, 0.82);
  s.lineTo(-2.2, 0.76);
  s.lineTo(-2.25, 0.5);
  s.lineTo(-2.25, 0.14);
  s.lineTo(-1.85, 0.12);
  s.absarc(-1.45, 0.36, 0.42, 0, Math.PI, false);
  s.lineTo(1.05, 0.12);
  s.absarc(1.45, 0.36, 0.42, Math.PI, 0, false);
  s.lineTo(2.25, 0.14);
  return s;
}

const PROFILES: Record<BodyStyle, () => THREE.Shape> = {
  sedan: sedanProfile,
  suv: suvProfile,
  hatchback: hatchbackProfile,
  pickup: pickupProfile,
  mpv: mpvProfile,
};

/** Cabin glasshouse per style */
function cabinProfile(style: BodyStyle): THREE.Shape {
  const s = new THREE.Shape();
  if (style === "suv" || style === "mpv") {
    s.moveTo(0.7, 0.68);
    s.quadraticCurveTo(0.4, 0.92, 0.0, 1.0);
    s.lineTo(-0.9, 1.02);
    s.quadraticCurveTo(-1.4, 1.0, -1.7, 0.84);
    s.lineTo(-0.9, 0.78);
    s.lineTo(0.7, 0.68);
  } else if (style === "pickup") {
    s.moveTo(0.7, 0.7);
    s.quadraticCurveTo(0.4, 0.94, 0.0, 1.02);
    s.lineTo(-0.35, 1.04);
    s.lineTo(-0.5, 0.78);
    s.lineTo(0.7, 0.7);
  } else {
    s.moveTo(0.55, 0.6);
    s.quadraticCurveTo(0.25, 0.86, -0.15, 0.94);
    s.quadraticCurveTo(-0.55, 0.98, -0.95, 0.9);
    s.quadraticCurveTo(-1.25, 0.82, -1.5, 0.66);
    s.lineTo(-0.8, 0.62);
    s.lineTo(0.55, 0.6);
  }
  return s;
}

/* ------------------------------- main component ----------------------------- */

const STYLE_DIMS: Record<BodyStyle, { width: number; wheelR: number; wheelbase: number }> = {
  sedan: { width: 1.7, wheelR: 0.33, wheelbase: 1.4 },
  suv: { width: 1.85, wheelR: 0.36, wheelbase: 1.4 },
  hatchback: { width: 1.68, wheelR: 0.32, wheelbase: 1.25 },
  pickup: { width: 1.85, wheelR: 0.36, wheelbase: 1.5 },
  mpv: { width: 1.8, wheelR: 0.34, wheelbase: 1.45 },
};

export default function ProceduralCarFamily({
  bodyStyle,
  paintHex,
  wheelId,
}: {
  bodyStyle: BodyStyle;
  paintHex: string;
  wheelId: string;
}) {
  const style = WHEEL_STYLE[wheelId] ?? WHEEL_STYLE["w-std"];
  const dims = STYLE_DIMS[bodyStyle];

  const bodyGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(PROFILES[bodyStyle](), {
      depth: dims.width - 0.24,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 3,
      curveSegments: 20,
    });
    geo.translate(0, 0, -(dims.width - 0.24) / 2);
    geo.computeVertexNormals();
    return geo;
  }, [bodyStyle, dims.width]);

  const cabinGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(cabinProfile(bodyStyle), {
      depth: dims.width - 0.6,
      bevelEnabled: true,
      bevelThickness: 0.07,
      bevelSize: 0.07,
      bevelSegments: 3,
      curveSegments: 16,
    });
    geo.translate(0, 0, -(dims.width - 0.6) / 2);
    geo.computeVertexNormals();
    return geo;
  }, [bodyStyle, dims.width]);

  const paintTarget = useMemo(() => new THREE.Color(paintHex), [paintHex]);
  const paintRef = useRef<THREE.MeshPhysicalMaterial>(null);
  useFrame((_, delta) => {
    paintRef.current?.color.lerp(paintTarget, 1 - Math.exp(-delta * 6));
  });

  const wb = dims.wheelbase;
  const track = dims.width / 2 - 0.08;
  const wheelPositions: [number, number, number][] = [
    [wb, dims.wheelR, track],
    [wb, dims.wheelR, -track],
    [-wb, dims.wheelR, track],
    [-wb, dims.wheelR, -track],
  ];

  return (
    <group>
      <mesh geometry={bodyGeo}>
        <meshPhysicalMaterial
          ref={paintRef}
          color={paintHex}
          metalness={0.7}
          roughness={0.3}
          clearcoat={1}
          clearcoatRoughness={0.06}
        />
      </mesh>
      <mesh geometry={cabinGeo} position={[0, 0.02, 0]}>
        <meshPhysicalMaterial color="#0a0e14" metalness={0.9} roughness={0.08} clearcoat={1} />
      </mesh>

      {/* headlights */}
      {[track * 0.62, -track * 0.62].map((z) => (
        <mesh key={z} position={[2.18, 0.5, z]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.08, 0.1, 0.32]} />
          <meshStandardMaterial color="#eaf4ff" emissive="#bcd8ff" emissiveIntensity={2} />
        </mesh>
      ))}
      {/* taillights */}
      <mesh position={[-2.26, 0.52, 0]}>
        <boxGeometry args={[0.05, 0.09, dims.width * 0.7]} />
        <meshStandardMaterial color="#550000" emissive="#ff1a1a" emissiveIntensity={1.6} />
      </mesh>

      {wheelPositions.map((pos, i) => (
        <Wheel
          key={i}
          position={pos}
          rimColor={style.rim}
          metalness={style.metalness}
          roughness={style.roughness}
          spokes={style.spokes}
          radius={dims.wheelR}
        />
      ))}
    </group>
  );
}

/** Bounding sphere per style for camera framing */
export const STYLE_SPHERE: Record<BodyStyle, THREE.Sphere> = {
  sedan: new THREE.Sphere(new THREE.Vector3(0, 0.5, 0), 2.5),
  suv: new THREE.Sphere(new THREE.Vector3(0, 0.55, 0), 2.55),
  hatchback: new THREE.Sphere(new THREE.Vector3(0, 0.48, 0), 2.3),
  pickup: new THREE.Sphere(new THREE.Vector3(0, 0.55, 0), 2.65),
  mpv: new THREE.Sphere(new THREE.Vector3(0, 0.55, 0), 2.6),
};
