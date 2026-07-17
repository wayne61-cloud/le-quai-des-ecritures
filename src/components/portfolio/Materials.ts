import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import ballBase from "@/assets/quai-fast/ball_base.jpg";
import ballNormal from "@/assets/quai-fast/ball_normal.jpg";
import boatBase from "@/assets/quai-fast/boat_base.jpg";
import boatNormal from "@/assets/quai-fast/boat_normal.jpg";
import concreteBase from "@/assets/quai-fast/concrete_base.jpg";
import concreteNormal from "@/assets/quai-fast/concrete_normal.jpg";
import pierBase from "@/assets/quai-fast/pier_base.jpg";
import pierNormal from "@/assets/quai-fast/pier_normal.jpg";
import pierRoughness from "@/assets/quai-fast/pier_roughness.jpg";
import turfBase from "@/assets/quai-fast/turf_base.jpg";
import turfNormal from "@/assets/quai-fast/turf_normal.jpg";
import waterBase from "@/assets/quai-fast/water_base.jpg";
import woodBase from "@/assets/quai-fast/wood_base.jpg";
import woodNormal from "@/assets/quai-fast/wood_normal.jpg";
import woodRoughness from "@/assets/quai-fast/wood_roughness.jpg";

type TextureUrls = {
  base: string;
  normal?: string;
  roughness?: string;
};

export function applyTextureSettings(
  texture: THREE.Texture | undefined,
  repeatX: number,
  repeatY: number,
  isColorMap = false,
) {
  if (!texture) return undefined;
  const cloned = texture.clone();
  cloned.wrapS = THREE.RepeatWrapping;
  cloned.wrapT = THREE.RepeatWrapping;
  cloned.repeat.set(repeatX, repeatY);
  cloned.anisotropy = 12;
  if (isColorMap) cloned.colorSpace = THREE.SRGBColorSpace;
  cloned.needsUpdate = true;
  return cloned;
}

function useTextureSet(urls: TextureUrls) {
  return useTexture({
    base: urls.base,
    normal: urls.normal ?? urls.base,
    roughness: urls.roughness ?? urls.base,
  });
}

function createMaterial(
  maps: Record<string, THREE.Texture>,
  repeat: [number, number],
  options: THREE.MeshStandardMaterialParameters = {},
) {
  return new THREE.MeshStandardMaterial({
    map: applyTextureSettings(maps.base, repeat[0], repeat[1], true),
    normalMap: applyTextureSettings(maps.normal, repeat[0], repeat[1]),
    roughnessMap: applyTextureSettings(maps.roughness, repeat[0], repeat[1]),
    roughness: 0.82,
    ...options,
  });
}

export function useQuaiMaterials() {
  const wood = useTextureSet({
    base: woodBase,
    normal: woodNormal,
    roughness: woodRoughness,
  });
  const pier = useTextureSet({
    base: pierBase,
    normal: pierNormal,
    roughness: pierRoughness,
  });
  const concrete = useTextureSet({
    base: concreteBase,
    normal: concreteNormal,
  });
  const boat = useTextureSet({
    base: boatBase,
    normal: boatNormal,
  });
  const turf = useTextureSet({
    base: turfBase,
    normal: turfNormal,
  });
  const ball = useTextureSet({
    base: ballBase,
    normal: ballNormal,
  });
  const water = useTexture(waterBase);

  return useMemo(() => {
    const waterMap = applyTextureSettings(water, 6, 4, true);

    return {
      wood: createMaterial(wood, [1.8, 1], {
        color: "#b98d61",
        roughness: 0.72,
      }),
      woodLight: createMaterial(wood, [1.5, 0.85], {
        color: "#c99b68",
        roughness: 0.68,
      }),
      woodDark: createMaterial(wood, [1.15, 0.85], {
        color: "#7f5232",
        roughness: 0.84,
      }),
      pier: createMaterial(pier, [1.2, 0.5], {
        color: "#a1764d",
        roughness: 0.88,
      }),
      pierDark: createMaterial(pier, [1.1, 0.55], {
        color: "#745033",
        roughness: 0.92,
      }),
      boat: createMaterial(boat, [1, 1], {
        color: "#b07c50",
        roughness: 0.72,
      }),
      concrete: createMaterial(concrete, [2.4, 2.4], {
        color: "#d6cbb9",
        roughness: 0.94,
      }),
      concreteWarm: createMaterial(concrete, [1.6, 1.1], {
        color: "#d9c3a2",
        roughness: 0.96,
      }),
      concreteCool: createMaterial(concrete, [1.8, 1.2], {
        color: "#c9d0c4",
        roughness: 0.96,
      }),
      turf: createMaterial(turf, [2.2, 2.2], {
        color: "#6f8b58",
        roughness: 0.96,
      }),
      paint: new THREE.MeshStandardMaterial({
        color: "#efe6d5",
        roughness: 0.86,
      }),
      paintWarm: new THREE.MeshStandardMaterial({
        color: "#f4e5ca",
        roughness: 0.9,
      }),
      foliage: new THREE.MeshStandardMaterial({
        color: "#6f8f5c",
        roughness: 0.96,
      }),
      metal: new THREE.MeshStandardMaterial({
        color: "#caa463",
        metalness: 0.52,
        roughness: 0.42,
      }),
      ball: createMaterial(ball, [1, 1], { roughness: 0.6 }),
      rope: new THREE.MeshStandardMaterial({ color: "#d8bd8c", roughness: 0.92 }),
      ink: new THREE.MeshStandardMaterial({ color: "#101723", roughness: 0.8 }),
      signFace: new THREE.MeshStandardMaterial({
        color: "#1d2932",
        roughness: 0.86,
        emissive: "#0b111a",
        emissiveIntensity: 0.05,
        transparent: true,
        opacity: 0.9,
      }),
      paper: new THREE.MeshStandardMaterial({ color: "#f2e8d0", roughness: 0.76 }),
      brass: new THREE.MeshStandardMaterial({
        color: "#d7ad61",
        emissive: "#5f3e16",
        emissiveIntensity: 0.08,
        metalness: 0.48,
        roughness: 0.38,
      }),
      glow: new THREE.MeshStandardMaterial({
        color: "#ffd28a",
        emissive: "#ffb45f",
        emissiveIntensity: 1.55,
        roughness: 0.45,
      }),
      waterTexture: waterMap,
    };
  }, [ball, boat, concrete, pier, turf, water, wood]);
}
