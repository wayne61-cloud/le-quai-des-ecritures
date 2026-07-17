import { useMemo } from "react";
import * as THREE from "three";

const vertexShader = `
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 vWorldPosition;

  void main() {
    float h = normalize(vWorldPosition + vec3(0.0, 12.0, 0.0)).y;
    float horizon = smoothstep(-0.18, 0.26, h);
    vec3 low = vec3(0.20, 0.46, 0.48);
    vec3 mid = vec3(0.94, 0.76, 0.58);
    vec3 high = vec3(0.88, 0.55, 0.40);
    vec3 color = mix(low, mid, horizon);
    color = mix(color, high, smoothstep(0.38, 0.98, h));

    float sun = pow(max(0.0, dot(normalize(vWorldPosition), normalize(vec3(-0.45, 0.22, -0.72)))), 18.0);
    color += vec3(1.0, 0.55, 0.24) * sun * 0.18;
    float bandA = sin(vWorldPosition.x * 0.035 + vWorldPosition.z * 0.018) * 0.5 + 0.5;
    float haze = smoothstep(0.04, 0.22, h) * (1.0 - smoothstep(0.42, 0.7, h));
    color = mix(color, vec3(0.95, 0.78, 0.61), bandA * haze * 0.11);
    gl_FragColor = vec4(color, 1.0);
  }
`;

export function SkyDome() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        side: THREE.BackSide,
        depthWrite: false,
        depthTest: false,
        fog: false,
      }),
    [],
  );

  return (
    <mesh material={material} renderOrder={-1000}>
      <sphereGeometry args={[58, 48, 24]} />
    </mesh>
  );
}
