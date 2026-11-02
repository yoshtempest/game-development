export type CoffinState = {
  id: string;
  x: number;
  y: number;
  npcType: string;
  phase: "closed" | "open" | "fading";
};
