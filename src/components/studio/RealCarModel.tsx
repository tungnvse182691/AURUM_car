import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const HF_BASE = "https://huggingface.co/datasets/tubecam00001/aurum-3d-cars/resolve/main/models";

/** Map car slug to 3D model file */
export const CAR_MODEL_MAP: Record<string, string> = {
  "toyota-vios-g-2024": "vios.glb",
  "honda-city-rs-2024": "city.glb",
  "hyundai-accent-2024": "accent.glb",
  "mazda-3-15-2024": "mazda3sedan.glb",
  "kia-k3-20-2024": "k3.glb",
  "toyota-corolla-altis-2024": "altis.glb",
  "toyota-corolla-cross-2024": "corollacross.glb",
  "honda-crv-2024": "crv.glb",
  "hyundai-tucson-2024": "tucson.glb",
  "mazda-cx5-2024": "cx5.glb",
  "kia-seltos-2024": "seltos.glb",
  "ford-territory-2024": "territory.glb",
  "toyota-yaris-2024": "yaris.glb",
  "mazda-3-hatchback-2024": "mazda3hb.glb",
  "ford-ranger-2024": "ranger.glb",
  "toyota-hilux-2024": "hilux.glb",
  "mitsubishi-xpander-2024": "xpander.glb",
  "toyota-innova-cross-2024": "innova.glb",
};

export function getModelUrl(slug: string): string | null {
  const file = CAR_MODEL_MAP[slug];
  return file ? `${HF_BASE}/${file}` : null;
}

export default function RealCarModel({
  modelUrl,
  paintHex,
}: {
  modelUrl: string;
  paintHex: string;
}) {
  const { scene } = useGLTF(modelUrl, true);

  const paintedScene = useMemo(() => {
    const cloned = scene.clone();
    const paintColor = new THREE.Color(paintHex);
    cloned.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        // Apply car paint material - keep original geometry, apply paint color
        mesh.material = new THREE.MeshPhysicalMaterial({
          color: paintColor,
          metalness: 0.7,
          roughness: 0.3,
          clearcoat: 1.0,
          clearcoatRoughness: 0.15,
        });
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return cloned;
  }, [scene, paintHex]);

  // Auto-center and position on floor
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(paintedScene);
    const size = box.getSize(new THREE.Vector3());
    // Scale to fit (target ~4 units long)
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? 4 / maxDim : 1;
    paintedScene.scale.setScalar(scale);
    // Recompute box after scale
    const box2 = new THREE.Box3().setFromObject(paintedScene);
    const center2 = box2.getCenter(new THREE.Vector3());
    // Center X/Z, put bottom on floor (y=0)
    paintedScene.position.x -= center2.x;
    paintedScene.position.z -= center2.z;
    paintedScene.position.y -= box2.min.y;
  }, [paintedScene]);

  return <primitive object={paintedScene} />;
}

// Preload helper
export function preloadModel(slug: string) {
  const url = getModelUrl(slug);
  if (url) useGLTF.preload(url, true);
}
