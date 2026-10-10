import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * ProceduralCar — a stylized supercar built from Three.js primitives.
 * Fully controllable: paint color, wheel finish, every part guaranteed to render.
 * Dimensions: ~4.6 (L) x 1.15 (H) x 1.92 (W). Sits on y=0, centered at origin.
 */

const WHEEL_STYLE: Record<string, { rim: string; metalness: number; roughness: number; spokes: number }> = {
  "w-std": { rim: "#c8ccd2", metalness: 0.9, roughness: 0.32, spokes: 5 },
  "w-sport": { rim: "#17181a", metalness: 0.6, roughness: 0.45, spokes: 5 },
  "w-carbon": { rim: "#0b0b0d", metalness: 0.85, roughness: 0.3, spokes: 7 },
  "w-gold": { rim: "#D4AF37", metalness: 0.95, roughness: 0.25, spokes: 5 },
};

/** Sleek supercar side profile (x = length axis, y = height) — low wedge, sharp creases */
function bodyShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(2.3, 0.1);
  s.lineTo(2.3, 0.32); // front bumper
  s.quadraticCurveTo(2.28, 0.42, 2.1, 0.45); // nose tip
  s.quadraticCurveTo(1.7, 0.5, 1.15, 0.52); // hood
  s.lineTo(0.75, 0.54); // cowl
  s.quadraticCurveTo(0.45, 0.56, 0.3, 0.68); // windshield base kick
  s.lineTo(-0.5, 0.68); // beltline
  s.quadraticCurveTo(-1.1, 0.66, -1.55, 0.58); // rear haunch
  s.quadraticCurveTo(-2.05, 0.5, -2.28, 0.48); // decklid to tail
  s.lineTo(-2.32, 0.32); // tail face
  s.lineTo(-2.32, 0.1); // rear lower
  // underbody with pronounced wheel arches
  s.lineTo(-1.85, 0.08);
  s.absarc(-1.45, 0.34, 0.42, 0, Math.PI, false); // rear arch (semicircle cutout)
  s.lineTo(1.05, 0.08);
  s.absarc(1.45, 0.34, 0.42, Math.PI, 0, false); // front arch
  s.lineTo(2.3, 0.1);
  return s;
}

/** Glasshouse — low, wraparound cabin */
function cabinShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0.62, 0.54);
  s.quadraticCurveTo(0.35, 0.82, -0.05, 0.92); // windshield
  s.quadraticCurveTo(-0.4, 0.99, -0.8, 0.94); // roof
  s.quadraticCurveTo(-1.15, 0.88, -1.45, 0.66); // rear glass
  s.quadraticCurveTo(-1.1, 0.6, -0.6, 0.6); // lower edge
  s.lineTo(0.62, 0.54);
  return s;
}

function Wheel({
  position,
  rimColor,
  metalness,
  roughness,
  spokes,
}: {
  position: [number, number, number];
  rimColor: string;
  metalness: number;
  roughness: number;
  spokes: number;
}) {
  const rim = useRef<THREE.Group>(null);
  const tireGeo = useMemo(() => new THREE.CylinderGeometry(0.34, 0.34, 0.26, 40), []);
  const rimGeo = useMemo(() => new THREE.CylinderGeometry(0.21, 0.21, 0.27, 24), []);
  const spokeGeo = useMemo(() => new THREE.BoxGeometry(0.05, 0.38, 0.28), []);
  const target = useMemo(() => new THREE.Color(rimColor), [rimColor]);

  useFrame((_, delta) => {
    if (!rim.current) return;
    const k = 1 - Math.exp(-delta * 6);
    rim.current.children.forEach((child) => {
      const mesh = child as THREE.Mesh;
      const m = mesh.material as THREE.MeshStandardMaterial;
      if (m && "color" in m && m.userData.isRim) {
        m.color.lerp(target, k);
        m.metalness += (metalness - m.metalness) * k;
        m.roughness += (roughness - m.roughness) * k;
      }
    });
  });

  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      {/* tire */}
      <mesh geometry={tireGeo}>
        <meshStandardMaterial color="#0c0c0d" roughness={0.92} metalness={0.05} />
      </mesh>
      {/* rim barrel */}
      <group ref={rim}>
        <mesh geometry={rimGeo}>
          <meshStandardMaterial
            color={rimColor}
            metalness={metalness}
            roughness={roughness}
            userData={{ isRim: true }}
          />
        </mesh>
        {/* spokes */}
        {Array.from({ length: spokes }).map((_, i) => (
          <mesh
            key={i}
            geometry={spokeGeo}
            rotation={[0, 0, (i / spokes) * Math.PI * 2]}
            position={[0, 0, 0]}
          >
            <meshStandardMaterial
              color={rimColor}
              metalness={metalness}
              roughness={roughness}
              userData={{ isRim: true }}
            />
          </mesh>
        ))}
        {/* center cap */}
        <mesh position={[0.14, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 0.02, 16]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>
      {/* brake disc hint */}
      <mesh position={[-0.02, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.2, 20]} />
        <meshStandardMaterial color="#3a3a3e" metalness={0.7} roughness={0.5} />
      </mesh>
    </group>
  );
}

export default function ProceduralCar({
  paintHex,
  wheelId,
}: {
  paintHex: string;
  wheelId: string;
}) {
  const style = WHEEL_STYLE[wheelId] ?? WHEEL_STYLE["w-std"];

  const bodyGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(bodyShape(), {
      depth: 1.56,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.09,
      bevelSegments: 3,
      curveSegments: 24,
    });
    geo.translate(0, 0, -0.78); // center width
    geo.computeVertexNormals();
    return geo;
  }, []);

  const cabinGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(cabinShape(), {
      depth: 1.2,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.07,
      bevelSegments: 3,
      curveSegments: 20,
    });
    geo.translate(0, 0, -0.6);
    geo.computeVertexNormals();
    return geo;
  }, []);

  const paintTarget = useMemo(() => new THREE.Color(paintHex), [paintHex]);
  const paintRef = useRef<THREE.MeshPhysicalMaterial>(null);
  useFrame((_, delta) => {
    if (paintRef.current) {
      paintRef.current.color.lerp(paintTarget, 1 - Math.exp(-delta * 6));
    }
  });

  const wheelPositions: [number, number, number][] = [
    [1.45, 0.34, 0.82],
    [1.45, 0.34, -0.82],
    [-1.45, 0.34, 0.82],
    [-1.45, 0.34, -0.82],
  ];

  return (
    <group>
      {/* main body */}
      <mesh geometry={bodyGeo} castShadow>
        <meshPhysicalMaterial
          ref={paintRef}
          color={paintHex}
          metalness={0.75}
          roughness={0.28}
          clearcoat={1}
          clearcoatRoughness={0.06}
        />
      </mesh>

      {/* glasshouse */}
      <mesh geometry={cabinGeo} position={[0, 0.02, 0]}>
        <meshPhysicalMaterial color="#0a0e14" metalness={0.9} roughness={0.08} clearcoat={1} />
      </mesh>

      {/* front splitter */}
      <mesh position={[2.2, 0.08, 0]}>
        <boxGeometry args={[0.3, 0.06, 1.7]} />
        <meshStandardMaterial color="#0d0d0f" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* side skirts */}
      {[0.86, -0.86].map((z) => (
        <mesh key={z} position={[0, 0.09, z]}>
          <boxGeometry args={[2.5, 0.07, 0.08]} />
          <meshStandardMaterial color="#0d0d0f" roughness={0.6} metalness={0.3} />
        </mesh>
      ))}

      {/* rear diffuser */}
      <mesh position={[-2.24, 0.12, 0]}>
        <boxGeometry args={[0.22, 0.14, 1.6]} />
        <meshStandardMaterial color="#0d0d0f" roughness={0.55} metalness={0.4} />
      </mesh>

      {/* rear spoiler */}
      <group position={[-2.05, 0.78, 0]}>
        {[0.55, -0.55].map((z) => (
          <mesh key={z} position={[0, -0.14, z]}>
            <boxGeometry args={[0.06, 0.28, 0.06]} />
            <meshStandardMaterial color="#111113" roughness={0.4} metalness={0.6} />
          </mesh>
        ))}
        <mesh position={[-0.08, 0.02, 0]}>
          <boxGeometry args={[0.42, 0.045, 1.5]} />
          <meshPhysicalMaterial color={paintHex} metalness={0.75} roughness={0.28} clearcoat={1} />
        </mesh>
      </group>

      {/* headlights */}
      {[0.52, -0.52].map((z) => (
        <mesh key={z} position={[2.2, 0.48, z]} rotation={[0, 0.35, 0]}>
          <boxGeometry args={[0.1, 0.09, 0.34]} />
          <meshStandardMaterial color="#eaf4ff" emissive="#bcd8ff" emissiveIntensity={2.2} />
        </mesh>
      ))}

      {/* taillight bar */}
      <mesh position={[-2.31, 0.52, 0]}>
        <boxGeometry args={[0.05, 0.08, 1.45]} />
        <meshStandardMaterial color="#550000" emissive="#ff1a1a" emissiveIntensity={1.8} />
      </mesh>

      {/* exhausts */}
      {[0.28, -0.28].map((z) => (
        <mesh key={z} position={[-2.32, 0.2, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.055, 0.055, 0.12, 16]} />
          <meshStandardMaterial color="#2a2a2e" metalness={0.9} roughness={0.35} />
        </mesh>
      ))}

      {/* gold accent line */}
      <mesh position={[0, 0.335, 0]}>
        <boxGeometry args={[4.3, 0.015, 1.94]} />
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.35} />
      </mesh>

      {/* wheels */}
      {wheelPositions.map((pos, i) => (
        <Wheel
          key={i}
          position={pos}
          rimColor={style.rim}
          metalness={style.metalness}
          roughness={style.roughness}
          spokes={style.spokes}
        />
      ))}
    </group>
  );
}
