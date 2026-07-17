import { Float, Html, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { skills } from "@/lib/cv-data";
import { scrollState } from "@/lib/scroll-state";
import { InvisibleCollider, MapLabel, type QuaiMaterials } from "./SceneKit";

const FEATURED_SKILLS = ["TVA", "Excel", "Paie", "Bilan", "Fiscalité", "Audit"];

function SkillLabel({ label }: { label: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useFrame(() => {
    if (ref.current) ref.current.style.display = scrollState.section === 3 ? "block" : "none";
  });

  return (
    <Html transform sprite center distanceFactor={2.8} position={[0, 0.055, 0.02]}>
      <span
        ref={ref}
        style={{
          display: "none",
          color: "#fff2d4",
          fontFamily: "Georgia, serif",
          fontSize: 7,
          textShadow: "0 1px 5px rgba(0,0,0,0.75)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </Html>
  );
}

export function SkillsField({ materials }: { materials: QuaiMaterials }) {
  return (
    <group position={[4.55, 0, 0.05]}>
      <mesh position={[0, 0.018, 0]} receiveShadow material={materials.turf}>
        <cylinderGeometry args={[2, 2, 0.08, 72]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.08, 0]} material={materials.paper}>
        <torusGeometry args={[1.52, 0.018, 8, 96]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.09, 0]} material={materials.paper}>
        <torusGeometry args={[0.68, 0.014, 8, 72]} />
      </mesh>
      {FEATURED_SKILLS.map((key, index) => {
        const angle = (index / FEATURED_SKILLS.length) * Math.PI * 2;
        const x = Math.cos(angle) * 1.22;
        const z = Math.sin(angle) * 1.22;
        const label = skills.find((skill) => skill.key === key)?.key ?? key;
        return (
          <group key={key} position={[x, 0.14, z]} rotation-y={-angle + Math.PI / 2}>
            <RoundedBox
              args={[0.44, 0.055, 0.2]}
              radius={0.04}
              smoothness={6}
              material={index % 2 ? materials.brass : materials.signFace}
              castShadow
            />
            <SkillLabel label={label} />
          </group>
        );
      })}
      <Float speed={1.7} rotationIntensity={0.45} floatIntensity={0.22}>
        <mesh position={[0, 0.34, 0]} castShadow material={materials.ball}>
          <sphereGeometry args={[0.25, 48, 28]} />
        </mesh>
      </Float>
      {[-1.75, 1.75].map((x) => (
        <group key={x} position={[x, 0.34, -1.72]}>
          <mesh material={materials.paint} castShadow>
            <cylinderGeometry args={[0.035, 0.04, 0.72, 10]} />
          </mesh>
          <RoundedBox
            args={[0.62, 0.34, 0.06]}
            radius={0.035}
            smoothness={5}
            position={[0, 0.38, 0]}
            material={materials.ink}
            castShadow
          />
        </group>
      ))}
      <RoundedBox
        args={[1.1, 0.055, 0.08]}
        radius={0.025}
        smoothness={4}
        position={[0, 0.96, -1.72]}
        material={materials.brass}
      />
      <MapLabel position={[0, 1.45, 1.38]} activeAt={0.48}>
        Découvrir mes compétences
      </MapLabel>
      <InvisibleCollider args={[4.4, 2.4, 4.4]} position={[0, 1.1, 0]} />
    </group>
  );
}
