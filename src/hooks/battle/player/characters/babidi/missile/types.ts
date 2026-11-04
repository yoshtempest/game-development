import type { BabidiTarget } from "@/utils/types/character/babidi";

export type Props = {
  PLAYER_SIZE: number;
  npcType: string;
  npcPhase: number;
  isAlfa: boolean;
  timeRef: React.RefObject<TimeEffect[]>;
  npc: { x: number; y: number };
  summons: SummonedNpc[];
  onProjectileHit: (target: BabidiTarget) => void;
  maxMissiles?: number;
  randomSpawn?: boolean;
};
