import { RoundedBox } from "@react-three/drei";
import { InvisibleCollider, LampPost, MapLabel, WoodenSign, type QuaiMaterials } from "./SceneKit";

export function ContactZone({ materials }: { materials: QuaiMaterials }) {
  return (
    <group position={[-1.18, 0.34, -8.72]} rotation-y={0.22}>
      <RoundedBox
        args={[2.4, 0.16, 1.32]}
        radius={0.08}
        smoothness={8}
        material={materials.wood}
        castShadow
        receiveShadow
      />
      {[-0.92, 0.92].map((x) =>
        [-0.48, 0.48].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, -0.18, z]} castShadow material={materials.woodDark}>
            <cylinderGeometry args={[0.055, 0.07, 0.56, 10]} />
          </mesh>
        )),
      )}
      {[-0.98, -0.32, 0.32, 0.98].map((x, index) => (
        <RoundedBox
          key={x}
          args={[0.52, 0.035, 1.2]}
          radius={0.025}
          smoothness={4}
          position={[x, 0.1, index % 2 ? 0.02 : -0.02]}
          material={index % 2 ? materials.pier : materials.wood}
        />
      ))}
      <group position={[0, 0.28, 0.02]} rotation-x={-0.08}>
        <RoundedBox
          args={[1.55, 0.055, 0.92]}
          radius={0.055}
          smoothness={8}
          material={materials.paper}
          castShadow
        />
        <RoundedBox
          args={[1.08, 0.022, 0.05]}
          radius={0.012}
          smoothness={3}
          position={[0, 0.052, -0.2]}
          material={materials.ink}
        />
        <RoundedBox
          args={[0.84, 0.018, 0.04]}
          radius={0.01}
          smoothness={3}
          position={[0, 0.055, 0.02]}
          material={materials.metal}
        />
        <RoundedBox
          args={[1.18, 0.018, 0.04]}
          radius={0.01}
          smoothness={3}
          position={[0, 0.058, 0.28]}
          material={materials.brass}
        />
      </group>
      <mesh
        position={[0.66, 0.43, -0.24]}
        rotation={[0.02, 0.18, Math.PI / 2]}
        castShadow
        material={materials.metal}
      >
        <cylinderGeometry args={[0.018, 0.018, 0.62, 10]} />
      </mesh>
      <RoundedBox
        args={[0.32, 0.035, 0.22]}
        radius={0.02}
        smoothness={4}
        position={[-0.84, 0.42, -0.26]}
        rotation-y={-0.18}
        castShadow
        material={materials.paper}
      />
      <WoodenSign
        title="Contact"
        position={[0.02, 0.86, -0.86]}
        rotation={[0, -0.08, 0]}
        materials={materials}
        width={1.02}
        activeAt={0.94}
        fontSize={0.065}
      />
      <RoundedBox
        args={[0.58, 0.08, 0.24]}
        radius={0.04}
        smoothness={6}
        position={[-0.48, 0.38, 0.6]}
        material={materials.brass}
        castShadow
      />
      <RoundedBox
        args={[0.74, 0.08, 0.24]}
        radius={0.04}
        smoothness={6}
        position={[0.38, 0.38, 0.6]}
        material={materials.ink}
        castShadow
      />
      <LampPost position={[-1.35, -0.28, -0.72]} materials={materials} height={0.58} />
      <MapLabel position={[0, 1.28, 0.55]} activeAt={0.94}>
        Me contacter
      </MapLabel>
      <InvisibleCollider args={[2.8, 2, 1.9]} position={[0, 0.7, 0]} />
    </group>
  );
}
