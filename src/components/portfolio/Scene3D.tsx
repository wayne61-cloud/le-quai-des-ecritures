"use client";

import { Suspense, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { CameraRig } from "./CameraRig";
import type { ZoneDefinition, ZoneId } from "./types";

const QUAI_MODEL_PATH = "/models/quai/scene-optimized.glb";
const DRACO_DECODER_PATH = "/draco/";
const DEBUG_HOTSPOTS = false;

type Scene3DProps = {
  zones: ZoneDefinition[];
  activeZone: ZoneId;
  openZone: ZoneId | null;
  onOpen: (id: ZoneId) => void;
};

type ModelHotspotTarget = {
  id: ZoneId;
  keywords: string[];
  fallbackPosition: [number, number, number];
  forceFallback?: boolean;
  offsetFactor: number;
  minOffset: number;
  selection: "all" | "best";
  labelOffset: { x: number; y: number };
  mobileLabelOffset: { x: number; y: number };
};

type ResolvedHotspot = {
  id: ZoneId;
  label: string;
  fallbackUsed: boolean;
  sourceNames: string[];
  size: THREE.Vector3;
  labelOffset: { x: number; y: number };
  mobileLabelOffset: { x: number; y: number };
  pointAnchor: THREE.Vector3;
  onMap: boolean | null;
};

const MODEL_HOTSPOT_TARGETS: ModelHotspotTarget[] = [
  {
    id: "experiences",
    keywords: ["pier", "ponton", "dock", "jetty"],
    fallbackPosition: [-1.46, 1.52, -0.64],
    offsetFactor: 0.72,
    minOffset: 0.34,
    selection: "best",
    labelOffset: { x: -132, y: -20 },
    mobileLabelOffset: { x: 78, y: 36 },
  },
  {
    id: "project",
    keywords: ["boat back", "pirogue", "canoe", "barque", "boat"],
    fallbackPosition: [1.55, 1.62, -1.49],
    forceFallback: true,
    offsetFactor: 1.05,
    minOffset: 0.28,
    selection: "best",
    labelOffset: { x: -124, y: 18 },
    mobileLabelOffset: { x: -58, y: 42 },
  },
  {
    id: "about",
    keywords: ["transat", "chair", "parasol", "umbrella", "beach_chair", "towel"],
    fallbackPosition: [-0.12, 1.8, -1.24],
    offsetFactor: 0.82,
    minOffset: 0.32,
    selection: "all",
    labelOffset: { x: -92, y: -62 },
    mobileLabelOffset: { x: 74, y: 34 },
  },
  {
    id: "cursus",
    keywords: ["door", "porte", "entry", "entrance", "building", "house"],
    fallbackPosition: [0.28, 1.76, -1.82],
    forceFallback: true,
    offsetFactor: 0.74,
    minOffset: 0.36,
    selection: "best",
    labelOffset: { x: 96, y: 18 },
    mobileLabelOffset: { x: 66, y: 38 },
  },
  {
    id: "skills",
    keywords: ["football", "soccer", "ball"],
    fallbackPosition: [0.34, 1.32, -0.96],
    offsetFactor: 1.2,
    minOffset: 0.18,
    selection: "best",
    labelOffset: { x: -82, y: 92 },
    mobileLabelOffset: { x: 10, y: 54 },
  },
  {
    id: "contact",
    keywords: ["sea", "water", "ocean", "contact"],
    fallbackPosition: [1.62, 1.25, 0.72],
    forceFallback: true,
    offsetFactor: 0.62,
    minOffset: 0.34,
    selection: "best",
    labelOffset: { x: -138, y: -18 },
    mobileLabelOffset: { x: -88, y: 44 },
  },
];

const normalizeName = (name: string) => name.trim().toLowerCase();

function getObjectBox(object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return null;
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);
  return { box, center, size };
}

function scoreObjectForTarget(object: THREE.Object3D, target: ModelHotspotTarget) {
  const metrics = getObjectBox(object);
  if (!metrics) return -Infinity;

  const name = normalizeName(object.name);
  const exactKeywordIndex = target.keywords.findIndex((keyword) => name === normalizeName(keyword));
  const keywordIndex = target.keywords.findIndex((keyword) =>
    name.includes(normalizeName(keyword)),
  );
  const keywordScore =
    exactKeywordIndex >= 0 ? 200 - exactKeywordIndex * 10 : 90 - keywordIndex * 8;

  if (target.id === "skills") {
    const maxAxis = Math.max(metrics.size.x, metrics.size.y, metrics.size.z);
    const minAxis = Math.max(0.001, Math.min(metrics.size.x, metrics.size.y, metrics.size.z));
    const roundness = minAxis / maxAxis;
    return keywordScore + roundness * 60 - maxAxis * 10;
  }

  if (target.id === "experiences") {
    const deckLength = Math.max(metrics.size.x, metrics.size.z);
    const flatness = metrics.size.y <= 0 ? 0 : deckLength / metrics.size.y;
    return keywordScore + deckLength * 20 + flatness * 4;
  }

  if (target.id === "project") {
    const boatFootprint = metrics.size.x * metrics.size.z;
    return keywordScore + boatFootprint * 20 - metrics.size.y * 2;
  }

  return keywordScore + metrics.size.x * metrics.size.z;
}

function findObjectsByKeywords(scene: THREE.Object3D, target: ModelHotspotTarget) {
  scene.updateWorldMatrix(true, true);
  const normalized = target.keywords.map(normalizeName);
  const exactMatches = normalized
    .map((name) => scene.getObjectByName(name))
    .filter((object): object is THREE.Object3D => Boolean(object));

  if (exactMatches.length > 0 && target.selection === "best") {
    return exactMatches
      .map((object) => ({ object, score: scoreObjectForTarget(object, target) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 1)
      .map((item) => item.object);
  }

  const matches: THREE.Object3D[] = [...exactMatches];
  scene.traverse((object) => {
    const objectName = normalizeName(object.name);
    const isMatch = normalized.some((name) => objectName.includes(name));
    if (isMatch && !matches.includes(object)) matches.push(object);
  });

  if (target.selection === "all") return matches;

  return matches
    .map((object) => ({ object, score: scoreObjectForTarget(object, target) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 1)
    .map((item) => item.object);
}

function getMapBounds(scene: THREE.Object3D) {
  const floor = scene.getObjectByName("floor.001") ?? scene.getObjectByName("water");
  return floor ? (getObjectBox(floor)?.box ?? null) : null;
}

function isPositionOnMap(position: THREE.Vector3, mapBounds: THREE.Box3 | null) {
  if (!mapBounds) return null;
  const margin = 0.08;
  return (
    position.x >= mapBounds.min.x - margin &&
    position.x <= mapBounds.max.x + margin &&
    position.z >= mapBounds.min.z - margin &&
    position.z <= mapBounds.max.z + margin
  );
}

function getHotspotPosition(scene: THREE.Object3D, target: ModelHotspotTarget) {
  if (target.forceFallback) {
    return {
      fallbackUsed: true,
      sourceNames: ["fallbackPosition"],
      size: new THREE.Vector3(0, 0, 0),
      labelOffset: target.labelOffset,
      mobileLabelOffset: target.mobileLabelOffset,
      pointAnchor: new THREE.Vector3(...target.fallbackPosition),
    };
  }

  const objects = findObjectsByKeywords(scene, target);
  if (objects.length === 0) {
    return {
      fallbackUsed: true,
      sourceNames: ["fallbackPosition"],
      size: new THREE.Vector3(0, 0, 0),
      labelOffset: target.labelOffset,
      mobileLabelOffset: target.mobileLabelOffset,
      pointAnchor: new THREE.Vector3(...target.fallbackPosition),
    };
  }

  const box = new THREE.Box3();
  objects.forEach((object) => box.expandByObject(object));
  if (box.isEmpty()) return null;

  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);

  return {
    fallbackUsed: false,
    sourceNames: objects.map((object) => object.name),
    size,
    labelOffset: target.labelOffset,
    mobileLabelOffset: target.mobileLabelOffset,
    pointAnchor: new THREE.Vector3(
      center.x,
      center.y + Math.max(size.y * target.offsetFactor, target.minOffset),
      center.z,
    ),
  };
}

function tuneQuaiMaterial(object: THREE.Mesh, material: THREE.MeshStandardMaterial) {
  const key = normalizeName(`${object.name} ${material.name}`);
  material.envMapIntensity = 0.62;
  material.needsUpdate = true;

  if (material.map) material.map.colorSpace = THREE.SRGBColorSpace;
  [material.map, material.normalMap, material.roughnessMap, material.aoMap].forEach((texture) => {
    if (!texture) return;
    texture.anisotropy = 16;
    texture.needsUpdate = true;
  });

  if (material.normalMap && material.normalScale) {
    material.normalScale.setScalar(1.08);
  }

  if (key.includes("water")) {
    material.roughness = 0.42;
    material.metalness = 0;
    material.envMapIntensity = 0.9;
    material.color.lerp(new THREE.Color("#0d5360"), 0.22);
  }

  if (key.includes("wood") || key.includes("pier") || key.includes("boat")) {
    material.roughness = Math.min(material.roughness || 0.78, 0.78);
    material.envMapIntensity = 0.7;
    if (material.normalMap && material.normalScale) material.normalScale.setScalar(1.24);
    material.color.lerp(new THREE.Color("#c79b63"), 0.08);
  }

  if (key.includes("concrete") || key.includes("ground") || key.includes("floor")) {
    material.roughness = Math.max(material.roughness || 0.82, 0.82);
    material.envMapIntensity = 0.48;
    if (material.normalMap && material.normalScale) material.normalScale.setScalar(1.18);
    material.color.lerp(new THREE.Color("#d6c5a9"), 0.06);
  }

  if (
    key.includes("football") ||
    key.includes("ball") ||
    key.includes("cotton") ||
    key.includes("towel")
  ) {
    material.roughness = Math.max(material.roughness || 0.76, 0.76);
    if (material.normalMap && material.normalScale) material.normalScale.setScalar(1.32);
  }

  if (key.includes("window")) {
    material.roughness = 0.26;
    material.envMapIntensity = 1.05;
    material.color.lerp(new THREE.Color("#9ec3cf"), 0.12);
  }
}

function avoidLabelOverlap(hotspots: ResolvedHotspot[]) {
  return hotspots.map((hotspot, index) => {
    const labelOffset = { ...hotspot.labelOffset };
    const mobileLabelOffset = { ...hotspot.mobileLabelOffset };

    hotspots.slice(0, index).forEach((previous) => {
      const closeInWorld =
        Math.abs(hotspot.pointAnchor.x - previous.pointAnchor.x) < 0.72 &&
        Math.abs(hotspot.pointAnchor.z - previous.pointAnchor.z) < 0.72;

      if (!closeInWorld) return;

      const direction = index % 2 === 0 ? 1 : -1;
      labelOffset.x += 28 * direction;
      labelOffset.y += index % 3 === 0 ? -24 : 24;
      mobileLabelOffset.x += 18 * direction;
      mobileLabelOffset.y += 18;
    });

    labelOffset.x = Math.max(-180, Math.min(180, labelOffset.x));
    labelOffset.y = Math.max(-92, Math.min(92, labelOffset.y));
    mobileLabelOffset.x = Math.max(-104, Math.min(104, mobileLabelOffset.x));
    mobileLabelOffset.y = Math.max(28, Math.min(86, mobileLabelOffset.y));

    return { ...hotspot, labelOffset, mobileLabelOffset };
  });
}

function CanvasLoader() {
  return (
    <Html center>
      <div className="rounded-sm border border-brass/35 bg-[#07111b]/70 px-4 py-3 text-center text-paper shadow-[0_18px_45px_rgba(0,0,0,0.26)] backdrop-blur-md">
        <div className="mx-auto h-1 w-16 animate-shimmer rounded-full bg-brass/70" />
        <p className="mt-3 whitespace-nowrap font-hand text-sm text-brass">
          Chargement du vrai quai...
        </p>
      </div>
    </Html>
  );
}

function ModelHotspot({
  label,
  position,
  active,
  labelOffset,
  mobileLabelOffset,
  onOpen,
}: {
  label: string;
  position: THREE.Vector3;
  active: boolean;
  labelOffset: { x: number; y: number };
  mobileLabelOffset: { x: number; y: number };
  onOpen: () => void;
}) {
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches;
  const displayOffset = isMobile ? mobileLabelOffset : labelOffset;

  return (
    <Html
      position={position.toArray()}
      center
      distanceFactor={isMobile ? 4.6 : 6}
      occlude={false}
      zIndexRange={[100, 0]}
      style={{ pointerEvents: "auto" }}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onOpen();
        }}
        style={{ pointerEvents: "auto" }}
        className={`group pointer-events-auto relative -m-3 p-3 outline-none transition duration-200 ${
          active ? "scale-105" : "scale-100"
        }`}
        aria-label={label}
      >
        <span className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d6b36a]/16 blur-md motion-safe:animate-pulse md:h-10 md:w-10" />
        <span className="relative flex h-7 w-7 items-center justify-center rounded-full border border-[#d6b36a]/85 bg-[#101722]/82 shadow-[0_0_18px_rgba(214,179,106,0.28)] backdrop-blur-sm transition group-hover:scale-110 group-hover:border-[#f1c66d] group-hover:bg-[#101722]/94 group-focus-visible:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-[#d6b36a] md:h-7 md:w-7">
          <span className="h-1.5 w-1.5 rounded-full bg-[#d6b36a] shadow-[0_0_12px_rgba(214,179,106,0.88)] md:h-2 md:w-2" />
          <span className="absolute -bottom-2 h-4 w-px bg-[#d6b36a]/55 md:h-4" />
        </span>
        <span
          className={`hotspot-cartouche pointer-events-auto absolute left-1/2 top-full mt-3 max-w-[min(230px,74vw)] whitespace-nowrap text-center transition duration-200 group-hover:opacity-100 group-hover:scale-100 group-focus-visible:opacity-100 group-focus-visible:scale-100 ${
            active ? "opacity-100 scale-100" : "opacity-75 scale-95"
          }`}
          style={{
            transform: `translate(calc(-50% + ${displayOffset.x}px), ${displayOffset.y}px)`,
          }}
        >
          {label}
          <span
            className="absolute left-1/2 top-0 h-5 w-px -translate-y-full bg-[#d6b36a]/45"
            style={{ transform: `translate(calc(-50% - ${displayOffset.x}px), -100%)` }}
          />
        </span>
      </button>
    </Html>
  );
}

function ModelHotspots({
  scene,
  zones,
  activeZone,
  openZone,
  onOpen,
}: {
  scene: THREE.Object3D;
  zones: ZoneDefinition[];
  activeZone: ZoneId;
  openZone: ZoneId | null;
  onOpen: (id: ZoneId) => void;
}) {
  const hotspots = useMemo(() => {
    const mapBounds = getMapBounds(scene);

    const resolvedHotspots = MODEL_HOTSPOT_TARGETS.flatMap((target) => {
      const zone = zones.find((item) => item.id === target.id);
      const resolved = getHotspotPosition(scene, target);
      if (!zone || !resolved) {
        if (DEBUG_HOTSPOTS) {
          console.warn(`[Hotspots] Aucune cible GLB fiable pour "${target.id}".`, {
            keywords: target.keywords,
            fallbackPosition: target.fallbackPosition,
          });
        }
        return [];
      }

      const onMap = isPositionOnMap(resolved.pointAnchor, mapBounds);
      if (onMap === false) {
        if (DEBUG_HOTSPOTS) {
          console.warn(`[Hotspots] Cible "${target.id}" hors map, fallback utilise.`, {
            sourceNames: resolved.sourceNames,
            position: resolved.pointAnchor.toArray(),
            fallbackPosition: target.fallbackPosition,
            mapBounds,
          });
        }
        const fallbackPosition = new THREE.Vector3(...target.fallbackPosition);
        return [
          {
            id: target.id,
            label: zone.label,
            fallbackUsed: true,
            sourceNames: ["fallbackPosition"],
            size: new THREE.Vector3(0, 0, 0),
            labelOffset: target.labelOffset,
            mobileLabelOffset: target.mobileLabelOffset,
            pointAnchor: fallbackPosition,
            onMap: isPositionOnMap(fallbackPosition, mapBounds),
          },
        ];
      }

      return [{ id: target.id, label: zone.label, onMap, ...resolved }];
    });

    return avoidLabelOverlap(resolvedHotspots);
  }, [scene, zones]);

  useEffect(() => {
    if (!DEBUG_HOTSPOTS) return;
    const objectNames: string[] = [];
    scene.traverse((object) => {
      if (object.name) objectNames.push(object.name);
    });
    console.groupCollapsed("[Hotspots] Audit GLB");
    console.log("Objets GLB:", objectNames);
    console.table(
      hotspots.map((hotspot) => ({
        id: hotspot.id,
        label: hotspot.label,
        objets: hotspot.sourceNames.join(", "),
        fallback: hotspot.fallbackUsed ? "oui" : "non",
        pointAnchor: hotspot.pointAnchor
          .toArray()
          .map((value) => Number(value.toFixed(3)))
          .join(", "),
        labelOffset: `${hotspot.labelOffset.x}, ${hotspot.labelOffset.y}`,
        mobileLabelOffset: `${hotspot.mobileLabelOffset.x}, ${hotspot.mobileLabelOffset.y}`,
        taille: hotspot.size
          .toArray()
          .map((value) => Number(value.toFixed(3)))
          .join(", "),
        surMap: hotspot.onMap === null ? "inconnu" : hotspot.onMap ? "oui" : "non",
      })),
    );
    console.groupEnd();
  }, [hotspots, scene]);

  return (
    <>
      {hotspots.map((hotspot) => (
        <ModelHotspot
          key={hotspot.id}
          label={hotspot.label}
          position={hotspot.pointAnchor}
          labelOffset={hotspot.labelOffset}
          mobileLabelOffset={hotspot.mobileLabelOffset}
          active={activeZone === hotspot.id || openZone === hotspot.id}
          onOpen={() => onOpen(hotspot.id)}
        />
      ))}
    </>
  );
}

function QuaiScene({ zones, activeZone, openZone, onOpen }: Scene3DProps) {
  const gltf = useGLTF(QUAI_MODEL_PATH, DRACO_DECODER_PATH);

  useEffect(() => {
    gltf.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      object.castShadow = true;
      object.receiveShadow = true;
      object.frustumCulled = true;

      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        if (!(material instanceof THREE.MeshStandardMaterial)) return;
        tuneQuaiMaterial(object, material);
      });
    });
  }, [gltf.scene]);

  return (
    <>
      <primitive object={gltf.scene} />
      <ModelHotspots
        scene={gltf.scene}
        zones={zones}
        activeZone={activeZone}
        openZone={openZone}
        onOpen={onOpen}
      />
    </>
  );
}

function SceneContent({ zones, activeZone, openZone, onOpen }: Scene3DProps) {
  return (
    <>
      <color attach="background" args={["#dea177"]} />
      <fogExp2 attach="fog" args={["#d6aa83", 0.015]} />

      <ambientLight intensity={0.09} color="#f9d8af" />
      <hemisphereLight args={["#ffe2bc", "#174e5a", 0.54]} />
      <directionalLight
        position={[-8, 5.8, 5.2]}
        intensity={2.15}
        color="#ffb56e"
        castShadow
        shadow-mapSize-width={1536}
        shadow-mapSize-height={1536}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <directionalLight position={[5, 2.8, -4]} intensity={0.22} color="#86b8cf" />

      <Suspense fallback={<CanvasLoader />}>
        <QuaiScene zones={zones} activeZone={activeZone} openZone={openZone} onOpen={onOpen} />
      </Suspense>
    </>
  );
}

useGLTF.preload(QUAI_MODEL_PATH, DRACO_DECODER_PATH);

export function Scene3D({ zones, activeZone, openZone, onOpen }: Scene3DProps) {
  return (
    <Canvas
      shadows={{ type: THREE.PCFShadowMap }}
      dpr={[0.6, 1]}
      camera={{ position: [0, 2.55, 8.2], fov: 46, near: 0.1, far: 100 }}
      performance={{ min: 0.5 }}
      gl={{
        antialias: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFShadowMap;
      }}
    >
      <CameraRig />
      <SceneContent zones={zones} activeZone={activeZone} openZone={openZone} onOpen={onOpen} />
    </Canvas>
  );
}
