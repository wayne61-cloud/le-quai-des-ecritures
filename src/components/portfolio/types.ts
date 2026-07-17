export type ZoneId =
  "intro" | "about" | "cursus" | "skills" | "experiences" | "project" | "contact";

export type ZoneDefinition = {
  id: ZoneId;
  label: string;
  navLabel: string;
  hint: string;
  center: number;
  x: string;
  y: string;
};
