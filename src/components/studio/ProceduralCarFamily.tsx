import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * ProceduralCarFamily — 5 mainstream body styles, clean low-poly look.
 * Built from crisp extruded profiles (NO bevel) + box details, flat-shaded.
 * 100% license-clean (built from scratch). Paint + wheels customizable.
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
  const tireGeo = useMemo(() => new THREE.CylinderGeometry(radius, radius, width, 28), [radius, width]);
  const rimGeo = useMemo(() => new THREE.CylinderGeometry(radius * 0.62, radius * 0.62, width + 0.012, 20), [radius, width]);
  const spokeGeo = useMemo(() => new THREE.BoxGeometry(0.055, radius * 1.05, width + 0.02), [radius, width]);
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
        <meshStandardMaterial color="#0c0c0d" roughness={0.92} metalness={0.05} flatShading />
      </mesh>
      <group ref={rim}>
        <mesh geometry={rimGeo}>
          <meshStandardMaterial color={rimColor} metalness={metalness} roughness={roughness} flatShading userData={{ isRim: true }} />
        </mesh>
        {Array.from({ length: spokes }).map((_, i) => (
          <mesh key={i} geometry={spokeGeo} rotation={[0, 0, (i / spokes) * Math.PI * 2]}>
            <meshStandardMaterial color={rimColor} metalness={metalness} roughness={roughness} flatShading userData={{ isRim: true }} />
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
// Crisp side profiles, x = length (front +), y = height. NO curves that blob.

function sedanProfile(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(2.25, 0.16);
  s.lineTo(2.25, 0.48);
  s.lineTo(1.95, 0.58);
  s.lineTo(1.05, 0.62); // hood
  s.lineTo(0.5, 0.66);
  s.lineTo(-0.05, 0.94); // windshield
  s.lineTo(-0.85, 0.97); // roof
  s.lineTo(-1.45, 0.88); // rear glass
  s.lineTo(-1.85, 0.64); // trunk
  s.lineTo(-2.25, 0.6);
  s.lineTo(-2.25, 0.16);
  s.lineTo(-1.82, 0.14);
  s.absarc(-1.4, 0.36, 0.42, 0, Math.PI, false); // rear arch
  s.lineTo(0.98, 0.14);
  s.absarc(1.4, 0.36, 0.42, Math.PI, 0, false); // front arch
  s.lineTo(2.25, 0.16);
  return s;
}

function suvProfile(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(2.2, 0.16);
  s.lineTo(2.2, 0.68);
  s.lineTo(1.95, 0.78);
  s.lineTo(1.15, 0.82); // hood
  s.lineTo(0.55, 0.86);
  s.lineTo(0.05, 1.14); // windshield
  s.lineTo(-1.15, 1.17); // roof
  s.lineTo(-1.85, 1.1);
  s.lineTo(-2.12, 0.95); // tailgate
  s.lineTo(-2.2, 0.7);
  s.lineTo(-2.2, 0.16);
  s.lineTo(-1.84, 0.14);
  s.absarc(-1.4, 0.4, 0.46, 0, Math.PI, false);
  s.lineTo(0.96, 0.14);
  s.absarc(1.4, 0.4, 0.46, Math.PI, 0, false);
  s.lineTo(2.2, 0.16);
  return s;
}

function hatchbackProfile(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(2.05, 0.16);
  s.lineTo(2.05, 0.48);
  s.lineTo(1.75, 0.57);
  s.lineTo(0.95, 0.6); // hood
  s.lineTo(0.4, 0.64);
  s.lineTo(-0.1, 0.9); // windshield
  s.lineTo(-0.85, 0.93); // roof
  s.lineTo(-1.45, 0.86);
  s.lineTo(-1.8, 0.66); // short tail
  s.lineTo(-1.92, 0.48);
  s.lineTo(-1.92, 0.16);
  s.lineTo(-1.66, 0.14);
  s.absarc(-1.25, 0.36, 0.42, 0, Math.PI, false);
  s.lineTo(0.85, 0.14);
  s.absarc(1.25, 0.36, 0.42, Math.PI, 0, false);
  s.lineTo(2.05, 0.16);
  return s;
}

function pickupProfile(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(2.3, 0.16);
  s.lineTo(2.3, 0.6);
  s.lineTo(2.05, 0.68);
  s.lineTo(1.25, 0.72); // hood
  s.lineTo(0.8, 0.75);
  s.lineTo(0.45, 1.06); // windshield
  s.lineTo(-0.25, 1.09); // cab roof
  s.lineTo(-0.52, 1.04);
  s.lineTo(-0.58, 0.8); // cab back
  s.lineTo(-0.64, 0.72);
  s.lineTo(-2.28, 0.72); // bed rail
  s.lineTo(-2.35, 0.58);
  s.lineTo(-2.35, 0.16);
  s.lineTo(-1.94, 0.14);
  s.absarc(-1.5, 0.4, 0.46, 0, Math.PI, false);
  s.lineTo(1.06, 0.14);
  s.absarc(1.5, 0.4, 0.46, Math.PI, 0, false);
  s.lineTo(2.3, 0.16);
  return s;
}

function mpvProfile(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(2.25, 0.16);
  s.lineTo(2.25, 0.54);
  s.lineTo(2.05, 0.66);
  s.lineTo(1.55, 0.74); // hood
  s.lineTo(0.95, 0.8);
  s.lineTo(0.45, 1.04); // windshield
  s.lineTo(-1.1, 1.1); // long roof
  s.lineTo(-1.8, 1.04);
  s.lineTo(-2.1, 0.88); // tailgate
  s.lineTo(-2.25, 0.68);
  s.lineTo(-2.25, 0.16);
  s.lineTo(-1.89, 0.14);
  s.absarc(-1.45, 0.4, 0.46, 0, Math.PI, false);
  s.lineTo(1.01, 0.14);
  s.absarc(1.45, 0.4, 0.46, Math.PI, 0, false);
  s.lineTo(2.25, 0.16);
  return s;
}

const PROFILES: Record<BodyStyle, () => THREE.Shape> = {
  sedan: sedanProfile,
  suv: suvProfile,
  hatchback: hatchbackProfile,
  pickup: pickupProfile,
  mpv: mpvProfile,
};

/** Cabin glasshouse per style — inset, crisp */
function cabinProfile(style: BodyStyle): THREE.Shape {
  const s = new THREE.Shape();
  if (style === "suv") {
    s.moveTo(0.95, 0.84);
    s.lineTo(0.45, 0.88);
    s.lineTo(0.0, 1.16);
    s.lineTo(-1.1, 1.19);
    s.lineTo(-1.75, 1.12);
    s.lineTo(-1.85, 0.94);
    s.lineTo(-0.6, 0.86);
    s.lineTo(0.95, 0.84);
  } else if (style === "mpv") {
    s.moveTo(1.35, 0.78);
    s.lineTo(0.85, 0.82);
    s.lineTo(0.4, 1.06);
    s.lineTo(-1.05, 1.12);
    s.lineTo(-1.7, 1.05);
    s.lineTo(-1.8, 0.9);
    s.lineTo(1.35, 0.78);
  } else if (style === "pickup") {
    s.moveTo(0.72, 0.76);
    s.lineTo(0.42, 1.06);
    s.lineTo(-0.22, 1.09);
    s.lineTo(-0.48, 1.03);
    s.lineTo(-0.53, 0.8);
    s.lineTo(0.72, 0.76);
  } else if (style === "hatchback") {
    s.moveTo(0.85, 0.62);
    s.lineTo(0.35, 0.66);
    s.lineTo(-0.08, 0.9);
    s.lineTo(-0.82, 0.93);
    s.lineTo(-1.35, 0.86);
    s.lineTo(-1.45, 0.7);
    s.lineTo(0.85, 0.62);
  } else {
    // sedan
    s.moveTo(0.95, 0.64);
    s.lineTo(0.45, 0.68);
    s.lineTo(-0.02, 0.94);
    s.lineTo(-0.82, 0.97);
    s.lineTo(-1.35, 0.88);
    s.lineTo(-1.45, 0.7);
    s.lineTo(0.95, 0.64);
  }
  return s;
}

/* ------------------------------- main component ----------------------------- */

const STYLE_DIMS: Record<BodyStyle, { width: number; wheelR: number; wheelbase: number }> = {
  sedan: { width: 1.7, wheelR: 0.34, wheelbase: 1.4 },
  suv: { width: 1.85, wheelR: 0.37, wheelbase: 1.4 },
  hatchback: { width: 1.68, wheelR: 0.33, wheelbase: 1.25 },
  pickup: { width: 1.85, wheelR: 0.37, wheelbase: 1.5 },
  mpv: { width: 1.8, wheelR: 0.35, wheelbase: 1.45 },
};

/** Front/rear x extents + light heights per style */
const STYLE_FRONT: Record<BodyStyle, { x: number; lightY: number; grilleY: number }> = {
  sedan: { x: 2.25, lightY: 0.52, grilleY: 0.34 },
  suv: { x: 2.2, lightY: 0.72, grilleY: 0.48 },
  hatchback: { x: 2.05, lightY: 0.52, grilleY: 0.34 },
  pickup: { x: 2.3, lightY: 0.64, grilleY: 0.42 },
  mpv: { x: 2.25, lightY: 0.6, grilleY: 0.4 },
};
const STYLE_REAR: Record<BodyStyle, { x: number; lightY: number }> = {
  sedan: { x: -2.25, lightY: 0.58 },
  suv: { x: -2.2, lightY: 0.85 },
  hatchback: { x: -1.92, lightY: 0.58 },
  pickup: { x: -2.35, lightY: 0.62 },
  mpv: { x: -2.25, lightY: 0.8 },
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
  const front = STYLE_FRONT[bodyStyle];
  const rear = STYLE_REAR[bodyStyle];

  const bodyGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(PROFILES[bodyStyle](), {
      depth: dims.width - 0.2,
      bevelEnabled: false, // crisp edges — no blob
      curveSegments: 12,
    });
    geo.translate(0, 0, -(dims.width - 0.2) / 2);
    geo.computeVertexNormals();
    return geo;
  }, [bodyStyle, dims.width]);

  const cabinGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(cabinProfile(bodyStyle), {
      depth: dims.width - 0.52, // inset glasshouse
      bevelEnabled: false,
      curveSegments: 8,
    });
    geo.translate(0, 0, -(dims.width - 0.52) / 2);
    geo.computeVertexNormals();
    return geo;
  }, [bodyStyle, dims.width]);

  const paintTarget = useMemo(() => new THREE.Color(paintHex), [paintHex]);
  const paintRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((_, delta) => {
    paintRef.current?.color.lerp(paintTarget, 1 - Math.exp(-delta * 6));
  });

  const wb = dims.wheelbase;
  const track = dims.width / 2 - 0.06;
  const wheelPositions: [number, number, number][] = [
    [wb, dims.wheelR, track],
    [wb, dims.wheelR, -track],
    [-wb, dims.wheelR, track],
    [-wb, dims.wheelR, -track],
  ];

  return (
    <group>
      {/* body — flat shaded for crisp low-poly facets */}
      <mesh geometry={bodyGeo}>
        <meshStandardMaterial
          ref={paintRef}
          color={paintHex}
          metalness={0.55}
          roughness={0.38}
          flatShading
        />
      </mesh>
      {/* glasshouse */}
      <mesh geometry={cabinGeo} position={[0, 0.015, 0]}>
        <meshStandardMaterial color="#0b0f16" metalness={0.9} roughness={0.12} flatShading />
      </mesh>

      {/* front grille */}
      <mesh position={[front.x - 0.02, front.grilleY, 0]}>
        <boxGeometry args={[0.06, 0.16, dims.width * 0.52]} />
        <meshStandardMaterial color="#101114" roughness={0.6} metalness={0.4} flatShading />
      </mesh>
      {/* front bumper */}
      <mesh position={[front.x - 0.03, 0.26, 0]}>
        <boxGeometry args={[0.1, 0.14, dims.width * 0.94]} />
        <meshStandardMaterial color="#17181b" roughness={0.7} metalness={0.2} flatShading />
      </mesh>
      {/* rear bumper */}
      <mesh position={[rear.x + 0.03, 0.26, 0]}>
        <boxGeometry args={[0.1, 0.14, dims.width * 0.94]} />
        <meshStandardMaterial color="#17181b" roughness={0.7} metalness={0.2} flatShading />
      </mesh>
      {/* side skirts */}
      {[track - 0.02, -(track - 0.02)].map((z) => (
        <mesh key={z} position={[0, 0.2, z]}>
          <boxGeometry args={[wb * 2 - 0.5, 0.1, 0.06]} />
          <meshStandardMaterial color="#17181b" roughness={0.7} metalness={0.2} flatShading />
        </mesh>
      ))}
      {/* side mirrors */}
      {[1, -1].map((side) => (
        <mesh key={side} position={[0.62, 0.88, side * (dims.width / 2 + 0.04)]}>
          <boxGeometry args={[0.1, 0.07, 0.08]} />
          <meshStandardMaterial color={paintHex} metalness={0.55} roughness={0.38} flatShading />
        </mesh>
      ))}

      {/* headlights */}
      {[track * 0.66, -track * 0.66].map((z) => (
        <mesh key={z} position={[front.x - 0.03, front.lightY, z]}>
          <boxGeometry args={[0.05, 0.09, 0.3]} />
          <meshStandardMaterial color="#eaf4ff" emissive="#cfe4ff" emissiveIntensity={2.2} flatShading />
        </mesh>
      ))}
      {/* taillight bar */}
      <mesh position={[rear.x + 0.02, rear.lightY, 0]}>
        <boxGeometry args={[0.05, 0.08, dims.width * 0.72]} />
        <meshStandardMaterial color="#5a0000" emissive="#ff2222" emissiveIntensity={1.8} flatShading />
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
  sedan: new THREE.Sphere(new THREE.Vector3(0, 0.55, 0), 2.6),
  suv: new THREE.Sphere(new THREE.Vector3(0, 0.66, 0), 2.75),
  hatchback: new THREE.Sphere(new THREE.Vector3(0, 0.52, 0), 2.4),
  pickup: new THREE.Sphere(new THREE.Vector3(0, 0.62, 0), 2.8),
  mpv: new THREE.Sphere(new THREE.Vector3(0, 0.62, 0), 2.75),
};
