// État de scroll partagé entre le DOM (scroll listener) et le canvas R3F.
// Un objet mutable évite les rerenders React et se lit dans useFrame().
export const scrollState = {
  progress: 0,
  section: 0,
  focusZone: null as string | null,
  focusStartedAt: 0,
};
