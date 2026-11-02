export type Props = {
  enabled: boolean;
  playerX: number;
  playerY: number;
  npcX: number;
  isPaused: boolean;
  spriteNpcType?: string;
};

export type PetState = {
  x: number;
  y: number;
  direction: "left" | "right";
  state:
    | "idle"
    | "walk"
    | "attack"
    | "jumping"
    | "jumpAttack"
    | "meleeAttack"
    | "get"
    | "run";
  npcType: string;
} | null;
