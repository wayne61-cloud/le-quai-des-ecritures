import { RoundedBox } from "@react-three/drei";
import { experiences } from "@/lib/cv-data";
import {
  InvisibleCollider,
  LampPost,
  MapLabel,
  Rope,
  WoodenSign,
  type QuaiMaterials,
} from "./SceneKit";

export function PierExperience({ materials }: { materials: QuaiMaterials }) {
  const planks = Array.from({ length: 18 }, (_, index) => ({
    z: -1.05 - index * 0.48,
    x: index % 2 === 0 ? -0.03 : 0.035,
    width: 2.5 + (index % 4) * 0.08,
    height: 0.095 + (index % 3) * 0.01,
  }));
  const posts = [-1.55, 1.55].flatMap((x) =>
    [-1.2, -2.4, -3.6, -4.8, -6, -7.2, -8.4].map((z) => ({ x, z })),
  );

  return (
    <group>
      {planks.map((plank, index) => (
        <RoundedBox
          key={index}
          args={[plank.width, plank.height, 0.34]}
          radius={0.028}
          smoothness={5}
          position={[plank.x, 0.13 + (index % 3) * 0.005, plank.z]}
          castShadow
          receiveShadow
          material={
            index % 4 === 0 ? materials.woodLight : index % 2 ? materials.pier : materials.pierDark
          }
        />
      ))}
      {[-0.78, 0, 0.78].map((x) => (
        <RoundedBox
          key={`under-beam-${x}`}
          args={[0.12, 0.12, 8.45]}
          radius={0.025}
          smoothness={4}
          position={[x, 0.045, -4.82]}
          castShadow
          material={materials.woodDark}
        />
      ))}
      {[-1.34, 1.34].map((x) => (
        <RoundedBox
          key={x}
          args={[0.09, 0.09, 8.65]}
          radius={0.025}
          smoothness={5}
          position={[x, 0.075, -4.8]}
          material={materials.woodDark}
          castShadow
        />
      ))}
      {posts.map((post) => (
        <group key={`${post.x}-${post.z}`}>
          <mesh position={[post.x, 0.44, post.z]} castShadow material={materials.woodDark}>
            <cylinderGeometry args={[0.055, 0.07, 0.82, 12]} />
          </mesh>
          <mesh position={[post.x, 0.89, post.z]} material={materials.glow}>
            <sphereGeometry args={[0.055, 16, 10]} />
          </mesh>
        </group>
      ))}
      {[-1.55, 1.55].map((x) =>
        [-1.2, -2.4, -3.6, -4.8, -6, -7.2].map((z) => (
          <Rope
            key={`${x}-${z}`}
            from={[x, 0.86, z]}
            to={[x, 0.86, z - 1.2]}
            materials={materials}
          />
        )),
      )}
      {experiences.map((experience, index) => {
        const z = -2.05 - index * 1.85;
        const x = index % 2 === 0 ? -1.34 : 1.34;
        return (
          <group key={experience.company} position={[x, 0.35, z]}>
            <LampPost position={[0, -0.2, 0]} materials={materials} height={0.58} />
            <WoodenSign
              title={experience.company}
              position={[0, 0.62, 0]}
              rotation={[0, index % 2 ? -0.28 : 0.28, 0]}
              materials={materials}
              width={1.06}
              activeAt={0.64}
              fontSize={0.06}
            />
          </group>
        );
      })}
      <MapLabel position={[0, 1.42, -4.75]} activeAt={0.64}>
        Explorer mes expériences
      </MapLabel>
      <InvisibleCollider args={[3.6, 2.2, 9.2]} position={[0, 1, -4.8]} />
    </group>
  );
}
