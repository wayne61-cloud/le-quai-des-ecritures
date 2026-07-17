import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll-state";
import type { ZoneId } from "./types";

type CameraStop = {
  progress: number;
  pos: THREE.Vector3;
  look: THREE.Vector3;
};

type CameraSample = {
  pos: THREE.Vector3;
  look: THREE.Vector3;
};

type FocusTarget = {
  pos: THREE.Vector3;
  look: THREE.Vector3;
};

const CAMERA_STOPS: CameraStop[] = [
  {
    progress: 0,
    pos: new THREE.Vector3(0, 4.08, 6.35),
    look: new THREE.Vector3(0, 1.05, -0.85),
  },
  {
    progress: 0.16,
    pos: new THREE.Vector3(-1.08, 2.72, 2.48),
    look: new THREE.Vector3(-0.12, 1.32, -1.24),
  },
  {
    progress: 0.32,
    pos: new THREE.Vector3(0.0, 2.86, 2.05),
    look: new THREE.Vector3(0.18, 1.42, -1.88),
  },
  {
    progress: 0.48,
    pos: new THREE.Vector3(0.9, 2.42, 2.32),
    look: new THREE.Vector3(0.34, 1.14, -0.96),
  },
  {
    progress: 0.64,
    pos: new THREE.Vector3(-2.72, 2.48, 1.92),
    look: new THREE.Vector3(-1.46, 1.12, -0.64),
  },
  {
    progress: 0.8,
    pos: new THREE.Vector3(3.0, 2.54, 1.98),
    look: new THREE.Vector3(1.42, 1.14, -1.38),
  },
  {
    progress: 0.94,
    pos: new THREE.Vector3(2.78, 2.72, 3.88),
    look: new THREE.Vector3(1.62, 1.08, 0.72),
  },
  {
    progress: 1,
    pos: new THREE.Vector3(2.78, 2.72, 3.88),
    look: new THREE.Vector3(1.62, 1.08, 0.72),
  },
];

const MOBILE_CAMERA_STOPS: CameraStop[] = [
  {
    progress: 0,
    pos: new THREE.Vector3(0, 4.25, 7.15),
    look: new THREE.Vector3(0, 1.12, -0.95),
  },
  {
    progress: 0.16,
    pos: new THREE.Vector3(-0.62, 3.02, 3.42),
    look: new THREE.Vector3(-0.1, 1.22, -1.2),
  },
  {
    progress: 0.32,
    pos: new THREE.Vector3(0.12, 3.12, 3.08),
    look: new THREE.Vector3(0.26, 1.32, -1.76),
  },
  {
    progress: 0.48,
    pos: new THREE.Vector3(0.82, 3.02, 3.44),
    look: new THREE.Vector3(0.36, 1.08, -0.92),
  },
  {
    progress: 0.64,
    pos: new THREE.Vector3(-1.72, 3.08, 3.4),
    look: new THREE.Vector3(-1.25, 1.12, -0.56),
  },
  {
    progress: 0.8,
    pos: new THREE.Vector3(2.16, 3.08, 3.32),
    look: new THREE.Vector3(1.38, 1.08, -1.28),
  },
  {
    progress: 0.94,
    pos: new THREE.Vector3(2.16, 3.18, 4.42),
    look: new THREE.Vector3(1.55, 1.02, 0.68),
  },
  {
    progress: 1,
    pos: new THREE.Vector3(2.16, 3.18, 4.42),
    look: new THREE.Vector3(1.55, 1.02, 0.68),
  },
];

const FOCUS_TARGETS: Partial<Record<ZoneId, FocusTarget>> = {
  about: {
    pos: new THREE.Vector3(-0.82, 2.18, 1.62),
    look: new THREE.Vector3(-0.12, 1.28, -1.24),
  },
  cursus: {
    pos: new THREE.Vector3(0.18, 2.2, 1.42),
    look: new THREE.Vector3(0.28, 1.35, -1.82),
  },
  skills: {
    pos: new THREE.Vector3(0.78, 1.9, 1.46),
    look: new THREE.Vector3(0.34, 1.08, -0.96),
  },
  experiences: {
    pos: new THREE.Vector3(-2.28, 2.08, 1.22),
    look: new THREE.Vector3(-1.46, 1.08, -0.64),
  },
  project: {
    pos: new THREE.Vector3(2.34, 2.08, 1.3),
    look: new THREE.Vector3(1.55, 1.08, -1.49),
  },
  contact: {
    pos: new THREE.Vector3(2.18, 2.18, 2.96),
    look: new THREE.Vector3(1.62, 1.06, 0.72),
  },
};

const MOBILE_FOCUS_TARGETS: Partial<Record<ZoneId, FocusTarget>> = {
  about: {
    pos: new THREE.Vector3(-0.38, 2.52, 2.42),
    look: new THREE.Vector3(-0.12, 1.2, -1.24),
  },
  cursus: {
    pos: new THREE.Vector3(0.2, 2.66, 2.42),
    look: new THREE.Vector3(0.28, 1.32, -1.82),
  },
  skills: {
    pos: new THREE.Vector3(0.62, 2.5, 2.5),
    look: new THREE.Vector3(0.34, 1.02, -0.96),
  },
  experiences: {
    pos: new THREE.Vector3(-1.32, 2.72, 2.62),
    look: new THREE.Vector3(-1.32, 1.08, -0.58),
  },
  project: {
    pos: new THREE.Vector3(1.92, 2.74, 2.52),
    look: new THREE.Vector3(1.5, 1.04, -1.42),
  },
  contact: {
    pos: new THREE.Vector3(1.98, 2.8, 3.64),
    look: new THREE.Vector3(1.62, 1.02, 0.72),
  },
};

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const smoothstep = (value: number) => value * value * (3 - 2 * value);

function samplePath(progress: number, out: CameraSample, stops: CameraStop[]) {
  const clamped = clamp(progress);
  const nextIndex = stops.findIndex((stop) => stop.progress >= clamped);
  const to = stops[nextIndex === -1 ? stops.length - 1 : nextIndex];
  const from = stops[Math.max(0, stops.indexOf(to) - 1)];
  const span = Math.max(0.001, to.progress - from.progress);
  const t = smoothstep(clamp((clamped - from.progress) / span));

  out.pos.lerpVectors(from.pos, to.pos, t);
  out.look.lerpVectors(from.look, to.look, t);
}

export function CameraRig() {
  const sample = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3() }), []);
  const lookRef = useRef(new THREE.Vector3(0, 1.1, -0.8));
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches;
  const reduceMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stops = isMobile ? MOBILE_CAMERA_STOPS : CAMERA_STOPS;
  const focusTargets = isMobile ? MOBILE_FOCUS_TARGETS : FOCUS_TARGETS;

  useFrame(({ camera, mouse }, delta) => {
    samplePath(scrollState.progress, sample, stops);
    const focusZone = scrollState.focusZone as ZoneId | null;
    const focusTarget = focusZone ? focusTargets[focusZone] : null;
    if (focusTarget) {
      sample.pos.copy(focusTarget.pos);
      sample.look.copy(focusTarget.look);
    }

    const parallax = isMobile || reduceMotion ? 0 : 1;
    const targetPosition = new THREE.Vector3(
      sample.pos.x + mouse.x * 0.08 * parallax,
      sample.pos.y + mouse.y * 0.04 * parallax,
      sample.pos.z,
    );
    const speed = reduceMotion ? 10 : focusTarget ? 8.8 : 6.8;
    const damping = 1 - Math.exp(-speed * delta);
    camera.position.lerp(targetPosition, damping);
    lookRef.current.lerp(sample.look, damping);
    camera.lookAt(lookRef.current);
  });

  return null;
}
