import type { BattleMapConfig } from "@/utils/types/maps/battle";

export type BattleSceneProps = {
  npcType: string;
  redirectTo?: string;
  audioSrc: string;
  onVictory?: () => void;
  map?: BattleMapConfig;
  background?: string;
  training?: boolean;
  isAlfa?: boolean;
  npcLevel?: number;
  PLAYER_SIZE: number;
};