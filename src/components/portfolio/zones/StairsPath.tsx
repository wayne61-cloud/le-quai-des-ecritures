import { RoundedBox } from "@react-three/drei";
import { InvisibleCollider, LampPost, MapLabel, WoodenSign, type QuaiMaterials } from "./SceneKit";
import { formation } from "@/lib/cv-data";

export function StairsPath({ materials }: { materials: QuaiMaterials }) {
  return (
    <group position={[1.8, 0, -0.35]} rotation-y={-0.12}>
      {Array.from({ length: 7 }, (_, index) => (
        <group key={index} position={[index * 0.34, index * 0.105, -index * 0.52]}>
          <RoundedBox
            args={[1.68 + (index % 2) * 0.06, 0.105, 0.68]}
            radius={0.04}
            smoothness={6}
            castShadow
            receiveShadow
            material={index % 2 ? materials.concreteWarm : materials.concreteCool}
          />
          <RoundedBox
            args={[1.72, 0.028, 0.075]}
            radius={0.018}
            smoothness={4}
            position={[0, 0.066, 0.31]}
            material={materials.brass}
          />
          <RoundedBox
            args={[1.62, 0.022, 0.045]}
            radius={0.012}
            smoothness={3}
            position={[0, -0.005, -0.31]}
            material={materials.woodDark}
          />
        </group>
      ))}
      {formation.map((item, index) => (
        <group
          key={item.period}
          position={[index * 0.7 - 0.56, 0.43 + index * 0.18, -0.72 - index * 1.02]}
          rotation-y={0.16}
        >
          <WoodenSign
            title={item.period}
            position={[0, 0, 0]}
            materials={materials}
            width={0.92}
            activeAt={0.32}
            fontSize={0.052}
          />
        </group>
      ))}
      {[-0.98, 1.12].map((x) => (
        <RoundedBox
          key={`rail-${x}`}
          args={[0.07, 0.07, 4.05]}
          radius={0.025}
          smoothness={4}
          position={[x + 1.04, 0.74, -1.68]}
          rotation-x={-0.2}
          rotation-z={-0.08}
          castShadow
          material={materials.woodDark}
        />
      ))}
      {[-0.85, 1.05].map((x) =>
        [0, 3, 6].map((step) => (
          <LampPost
            key={`${x}-${step}`}
            position={[step * 0.34 + x, step * 0.105 + 0.03, -step * 0.52]}
            materials={materials}
            height={0.42}
          />
        )),
      )}
      <MapLabel position={[1.28, 1.75, -2.45]} activeAt={0.32}>
        Voir mon cursus
      </MapLabel>
      <InvisibleCollider args={[4.8, 2.8, 4.8]} position={[1.1, 1.1, -1.65]} />
    </group>
  );
}
