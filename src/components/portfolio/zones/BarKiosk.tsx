import { RoundedBox } from "@react-three/drei";
import { InvisibleCollider, LampPost, MapLabel, WoodenSign, type QuaiMaterials } from "./SceneKit";

export function BarKiosk({ materials }: { materials: QuaiMaterials }) {
  const plankXs = [-1.45, -0.86, -0.29, 0.29, 0.86, 1.45];
  const counterSlats = Array.from({ length: 12 }, (_, index) => index * 0.32 - 1.76);
  const shelfItems = [
    { x: -1.05, y: 1.12, z: 0.42, h: 0.28 },
    { x: -0.72, y: 1.1, z: 0.4, h: 0.22 },
    { x: 0.92, y: 1.12, z: 0.42, h: 0.25 },
  ];

  return (
    <group position={[-4.2, 0, -1.05]} rotation-y={0.08}>
      <RoundedBox
        args={[3.8, 0.16, 1.95]}
        radius={0.06}
        smoothness={8}
        position={[0, 0.16, 0]}
        material={materials.concrete}
        receiveShadow
      />
      {plankXs.map((x, index) => (
        <RoundedBox
          key={x}
          args={[0.5, 0.76, 1.48]}
          radius={0.055}
          smoothness={7}
          position={[x, 0.62, 0.08 + (index % 2) * 0.015]}
          castShadow
          receiveShadow
          material={index % 2 ? materials.paint : materials.paintWarm}
        />
      ))}
      {plankXs.map((x, index) => (
        <RoundedBox
          key={`${x}-front`}
          args={[0.48, 0.62, 0.08]}
          radius={0.035}
          smoothness={5}
          position={[x, 0.65, 0.88]}
          castShadow
          material={index % 2 ? materials.woodDark : materials.pier}
        />
      ))}
      {counterSlats.map((x, index) => (
        <RoundedBox
          key={`counter-slat-${x}`}
          args={[0.045, 0.075, 1.72]}
          radius={0.014}
          smoothness={3}
          position={[x, 1.155, 0.16 + (index % 2) * 0.012]}
          castShadow
          material={index % 3 ? materials.woodLight : materials.woodDark}
        />
      ))}
      <RoundedBox
        args={[4.05, 0.16, 1.95]}
        radius={0.065}
        smoothness={8}
        position={[0, 1.05, 0.14]}
        castShadow
        material={materials.woodLight}
      />
      <RoundedBox
        args={[4.22, 0.08, 0.12]}
        radius={0.03}
        smoothness={5}
        position={[0, 1.22, 1.12]}
        castShadow
        material={materials.brass}
      />
      <RoundedBox
        args={[3.65, 1.18, 0.12]}
        radius={0.055}
        smoothness={7}
        position={[0, 1.72, -0.78]}
        castShadow
        material={materials.woodDark}
      />
      {[-1.45, -0.7, 0.05, 0.8, 1.55].map((x) => (
        <RoundedBox
          key={`back-frame-${x}`}
          args={[0.045, 1.25, 0.16]}
          radius={0.018}
          smoothness={3}
          position={[x, 1.73, -0.69]}
          castShadow
          material={materials.brass}
        />
      ))}
      <RoundedBox
        args={[4.35, 0.15, 2.28]}
        radius={0.07}
        smoothness={8}
        position={[0, 2.68, 0]}
        rotation-x={-0.12}
        castShadow
        material={materials.paintWarm}
      />
      <RoundedBox
        args={[4.58, 0.08, 2.46]}
        radius={0.035}
        smoothness={5}
        position={[0, 2.55, 0.02]}
        rotation-x={-0.12}
        castShadow
        material={materials.woodDark}
      />
      {[-1.72, -0.86, 0, 0.86, 1.72].map((x) => (
        <RoundedBox
          key={`roof-rib-${x}`}
          args={[0.055, 0.105, 2.54]}
          radius={0.02}
          smoothness={3}
          position={[x, 2.61, 0.02]}
          rotation-x={-0.12}
          castShadow
          material={materials.brass}
        />
      ))}
      {[
        [-1.95, 1.65, 0.92],
        [1.95, 1.65, 0.92],
        [-1.85, 1.65, -0.86],
        [1.85, 1.65, -0.86],
      ].map(([x, y, z]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]} castShadow material={materials.wood}>
          <cylinderGeometry args={[0.055, 0.07, 2.55, 12]} />
        </mesh>
      ))}
      <WoodenSign
        title="À propos"
        position={[0, 2.05, -0.7]}
        materials={materials}
        width={1.85}
        activeAt={0.16}
      />
      {shelfItems.map((item) => (
        <RoundedBox
          key={`${item.x}-${item.h}`}
          args={[0.16, item.h, 0.16]}
          radius={0.035}
          smoothness={6}
          position={[item.x, item.y, item.z]}
          castShadow
          material={materials.brass}
        />
      ))}
      <RoundedBox
        args={[0.96, 0.5, 0.09]}
        radius={0.035}
        smoothness={6}
        position={[1.2, 1.58, -0.69]}
        material={materials.signFace}
      />
      <RoundedBox
        args={[1.08, 0.06, 0.11]}
        radius={0.018}
        smoothness={3}
        position={[1.2, 1.86, -0.685]}
        material={materials.brass}
      />
      {[-0.18, 0.02, 0.22].map((x, index) => (
        <RoundedBox
          key={`menu-line-${index}`}
          args={[0.38 - index * 0.04, 0.035, 0.105]}
          radius={0.012}
          smoothness={3}
          position={[1.2 + x, 1.58 - index * 0.11, -0.625]}
          material={materials.paper}
        />
      ))}
      <LampPost position={[-2.45, 0, 1.05]} materials={materials} height={0.62} />
      <pointLight position={[0, 2.28, 0.35]} intensity={5.2} distance={5} color="#ffc57a" />
      <MapLabel position={[0.05, 3.05, 0.55]} activeAt={0.16}>
        À propos — Clique ici
      </MapLabel>
      <InvisibleCollider args={[4.6, 3.2, 2.4]} position={[0, 1.6, 0]} />
    </group>
  );
}
