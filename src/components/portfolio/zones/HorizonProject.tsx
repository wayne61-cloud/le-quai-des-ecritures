import { Float, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll-state";
import { InvisibleCollider, MapLabel, WoodenSign, type QuaiMaterials } from "./SceneKit";

export function HorizonProject({ materials }: { materials: QuaiMaterials }) {
  const projectRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (projectRef.current) {
      projectRef.current.visible = Math.abs(scrollState.progress - 0.8) < 0.18;
    }
  });

  return (
    <group>
      <WaterPlane materials={materials} />
      <group ref={projectRef}>
        <group position={[2.55, 0.06, -10.35]} rotation-y={-0.48}>
          <Float speed={0.8} rotationIntensity={0.08} floatIntensity={0.08}>
            <Boat materials={materials} />
          </Float>
        </group>
        <group position={[-2.8, 0.32, -8.4]} rotation-y={0.55}>
          <WoodenSign
            title="Projet professionnel"
            position={[0, 0.72, 0]}
            materials={materials}
            width={1.75}
            activeAt={0.8}
          />
          <mesh position={[0, 0.25, 0]} castShadow material={materials.wood}>
            <cylinderGeometry args={[0.05, 0.065, 0.9, 12]} />
          </mesh>
        </group>
        <MapLabel position={[1.25, 1.28, -9.3]} activeAt={0.8}>
          Voir mon projet
        </MapLabel>
        <InvisibleCollider args={[6, 2.4, 7]} position={[0.7, 1, -10]} />
      </group>
    </group>
  );
}

function WaterPlane({ materials }: { materials: QuaiMaterials }) {
  const meshRef = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>>(null);
  const waterMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uMap: { value: materials.waterTexture },
          uDeep: { value: new THREE.Color("#0f4d61") },
          uShallow: { value: new THREE.Color("#3d8a86") },
          uFoam: { value: new THREE.Color("#c9d7c2") },
        },
        vertexShader: `
          uniform float uTime;
          varying vec2 vUv;
          varying vec3 vWorldPosition;

          void main() {
            vUv = uv;
            vec3 pos = position;
            float waveA = sin((pos.x * 0.12 + pos.y * 0.18) + uTime * 0.55) * 0.055;
            float waveB = sin((pos.x * -0.18 + pos.y * 0.1) + uTime * 0.38) * 0.035;
            pos.z += waveA + waveB;
            vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform sampler2D uMap;
          uniform vec3 uDeep;
          uniform vec3 uShallow;
          uniform vec3 uFoam;
          varying vec2 vUv;
          varying vec3 vWorldPosition;

          void main() {
            vec2 uvA = vUv * vec2(2.4, 1.7) + vec2(uTime * 0.006, uTime * 0.003);
            vec2 uvB = vUv * vec2(4.2, 2.9) + vec2(-uTime * 0.004, uTime * 0.006);
            float noiseA = texture2D(uMap, uvA).r;
            float noiseB = texture2D(uMap, uvB).g;
            float ripple = smoothstep(0.46, 0.78, noiseA * 0.62 + noiseB * 0.38);
            float depth = smoothstep(-22.0, 9.0, vWorldPosition.z);
            vec3 color = mix(uDeep, uShallow, depth * 0.58 + ripple * 0.08);
            color = mix(color, uFoam, ripple * 0.07);
            gl_FragColor = vec4(color, 0.72);
          }
        `,
      }),
    [materials.waterTexture],
  );

  useFrame(({ clock }) => {
    waterMaterial.uniforms.uTime.value = clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.position.y = -0.055 + Math.sin(clock.elapsedTime * 0.45) * 0.012;
    }
  });

  return (
    <mesh
      ref={meshRef}
      rotation-x={-Math.PI / 2}
      position={[0, -0.05, -9]}
      receiveShadow
      material={waterMaterial}
    >
      <planeGeometry args={[90, 70, 72, 48]} />
    </mesh>
  );
}

function Boat({ materials }: { materials: QuaiMaterials }) {
  return (
    <group>
      <RoundedBox
        args={[1.9, 0.28, 0.62]}
        radius={0.18}
        smoothness={12}
        position={[0, 0.18, 0]}
        castShadow
        material={materials.boat}
      />
      <RoundedBox
        args={[1.48, 0.12, 0.7]}
        radius={0.12}
        smoothness={10}
        position={[0.02, 0.34, 0]}
        castShadow
        material={materials.wood}
      />
      <RoundedBox
        args={[0.54, 0.42, 0.48]}
        radius={0.08}
        smoothness={8}
        position={[-0.28, 0.66, 0]}
        castShadow
        material={materials.paint}
      />
      <mesh position={[0.26, 1.04, 0]} castShadow material={materials.wood}>
        <cylinderGeometry args={[0.025, 0.03, 1.24, 10]} />
      </mesh>
      <mesh position={[0.47, 1.08, 0.02]} rotation-y={0.16} castShadow material={materials.paper}>
        <planeGeometry args={[0.78, 0.88]} />
      </mesh>
      <RoundedBox
        args={[0.18, 0.06, 0.42]}
        radius={0.025}
        smoothness={5}
        position={[-0.78, 0.52, 0]}
        material={materials.brass}
      />
    </group>
  );
}
