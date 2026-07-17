import { Html, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll-state";
import type { useQuaiMaterials } from "../Materials";

export type QuaiMaterials = ReturnType<typeof useQuaiMaterials>;

export function FocusGroup({
  activeAt,
  section,
  range = 0.22,
  children,
}: {
  activeAt: number;
  section?: number;
  range?: number;
  children: ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const distance = Math.abs(scrollState.progress - activeAt);
    const visible =
      section === undefined
        ? distance < range
        : section === 0 || section === 6
          ? scrollState.section === section
          : Math.abs(scrollState.section - section) <= 1;
    groupRef.current.visible = visible;

    if (visible) {
      const focus =
        section === undefined
          ? Math.max(0, 1 - distance / range)
          : scrollState.section === section
            ? 1
            : 0.36;
      const targetScale = 0.94 + focus * 0.06;
      const scale = THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 8, delta);
      groupRef.current.scale.setScalar(scale);
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

export function MapLabel({
  children: _children,
  position: _position,
  small: _small = false,
  activeAt: _activeAt,
}: {
  children: string;
  position: [number, number, number];
  small?: boolean;
  activeAt?: number;
}) {
  return null;
}

export function WoodenSign({
  title,
  position,
  rotation = [0, 0, 0],
  materials,
  width = 1.6,
  activeAt,
  fontSize = 0.09,
}: {
  title: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  materials: QuaiMaterials;
  width?: number;
  activeAt?: number;
  fontSize?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const visible = activeAt === undefined || Math.abs(scrollState.progress - activeAt) < 0.08;
    groupRef.current.visible = visible;
    if (labelRef.current) labelRef.current.style.display = visible ? "block" : "none";
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <RoundedBox
        args={[width, 0.3, 0.065]}
        radius={0.035}
        smoothness={6}
        castShadow
        receiveShadow
        material={materials.signFace}
      />
      <RoundedBox
        args={[width + 0.12, 0.045, 0.09]}
        radius={0.025}
        smoothness={4}
        position={[0, 0.17, 0]}
        material={materials.brass}
      />
      <RoundedBox
        args={[width + 0.12, 0.045, 0.09]}
        radius={0.025}
        smoothness={4}
        position={[0, -0.17, 0]}
        material={materials.brass}
      />
      <Html
        transform
        center
        distanceFactor={4.4}
        position={[0, 0.01, 0.052]}
        style={{ pointerEvents: "none" }}
      >
        <span
          ref={labelRef}
          style={{
            display: activeAt === undefined ? "block" : "none",
            width: `${Math.max(68, width * 58)}px`,
            color: "#fff2d4",
            fontFamily: "Georgia, serif",
            fontSize: `${Math.max(8, fontSize * 70)}px`,
            letterSpacing: "0.03em",
            lineHeight: 1.05,
            textAlign: "center",
            textShadow: "0 1px 7px rgba(0,0,0,0.75)",
            whiteSpace: "normal",
          }}
        >
          {title}
        </span>
      </Html>
    </group>
  );
}

export function LampPost({
  position,
  materials,
  height = 0.82,
  light = false,
}: {
  position: [number, number, number];
  materials: QuaiMaterials;
  height?: number;
  light?: boolean;
}) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow material={materials.metal}>
        <cylinderGeometry args={[0.026, 0.034, height, 10]} />
      </mesh>
      <mesh position={[0, height + 0.045, 0]} material={materials.glow}>
        <cylinderGeometry args={[0.042, 0.05, 0.07, 14]} />
      </mesh>
      {light && (
        <pointLight
          position={[0, height + 0.07, 0]}
          intensity={1.25}
          distance={1.8}
          color="#ffbd72"
        />
      )}
    </group>
  );
}

export function Rope({
  from,
  to,
  materials,
}: {
  from: [number, number, number];
  to: [number, number, number];
  materials: QuaiMaterials;
}) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const mid = start.clone().lerp(end, 0.5);
  const direction = end.clone().sub(start);
  const length = direction.length();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize(),
  );

  return (
    <mesh position={mid} quaternion={quaternion} castShadow material={materials.rope}>
      <cylinderGeometry args={[0.018, 0.018, length, 10]} />
    </mesh>
  );
}

export function InvisibleCollider({
  args,
  position,
}: {
  args: [number, number, number];
  position: [number, number, number];
}) {
  return (
    <mesh visible={false} position={position}>
      <boxGeometry args={args} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}
