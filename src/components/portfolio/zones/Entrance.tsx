import { RoundedBox } from "@react-three/drei";
import { InvisibleCollider, LampPost, MapLabel, WoodenSign, type QuaiMaterials } from "./SceneKit";

export function Entrance({ materials }: { materials: QuaiMaterials }) {
  const tiles = Array.from({ length: 18 }, (_, index) => {
    const x = (index % 6) * 1.05 - 2.65;
    const z = Math.floor(index / 6) * 0.86 + 3.45;
    return { x, z, tone: index % 3 === 0 ? "#d7cbbb" : "#cfc2af" };
  });

  return (
    <group>
      {tiles.map((tile, index) => (
        <RoundedBox
          key={index}
          args={[0.98, 0.08, 0.78]}
          radius={0.035}
          smoothness={5}
          position={[tile.x, 0.02, tile.z]}
          receiveShadow
          material={materials.concrete}
        />
      ))}
      <RoundedBox
        args={[6.7, 0.18, 0.18]}
        radius={0.04}
        smoothness={5}
        position={[0, 0.12, 3.15]}
        material={materials.paint}
      />
      <RoundedBox
        args={[6.7, 0.18, 0.18]}
        radius={0.04}
        smoothness={5}
        position={[0, 0.12, 6.1]}
        material={materials.paint}
      />
      <group position={[0, 1.2, 4.85]}>
        <WoodenSign
          title="Le Quai des Écritures"
          position={[0, 0, 0]}
          materials={materials}
          width={2.45}
          fontSize={0.1}
        />
        <RoundedBox
          args={[1.35, 0.06, 0.1]}
          radius={0.025}
          smoothness={4}
          position={[0, -0.34, 0.04]}
          material={materials.brass}
        />
      </group>
      {[-3.1, 3.1].map((x) => (
        <LampPost key={x} position={[x, 0.02, 4.1]} materials={materials} height={0.72} />
      ))}
      {[-3.35, 3.35].map((x) => (
        <group key={x} position={[x, 0.03, 5.6]}>
          <RoundedBox
            args={[0.9, 0.12, 0.45]}
            radius={0.08}
            smoothness={8}
            material={materials.foliage}
          />
          <mesh position={[0.22, 0.13, 0.04]} material={materials.foliage}>
            <sphereGeometry args={[0.18, 16, 12]} />
          </mesh>
          <mesh position={[-0.18, 0.16, -0.05]} material={materials.foliage}>
            <sphereGeometry args={[0.15, 16, 12]} />
          </mesh>
        </group>
      ))}
      <MapLabel position={[0, 1.25, 3.45]} activeAt={0.02}>
        Commencer
      </MapLabel>
      <InvisibleCollider args={[5.5, 1.5, 2.2]} position={[0, 0.75, 4.7]} />
    </group>
  );
}
