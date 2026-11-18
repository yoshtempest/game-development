import type { BattleEntitiesBattle } from "@/components/Game/Battle/Entities/types";
import type { CutInEnemieOverlay } from "@/hooks/battle/player/characters/marshadow/useMarshadowCutInEnemie";
import { NPCBattle } from "@/components/Game/Entities/Npc/Battle";
import type { BattleOutroResult } from "@/utils/types/battle/outro";

export type MainNpcProps = {
  x: number;
  y: number;
  TILE_SIZE: number;
  npcType: string;
  state: Parameters<typeof NPCBattle>[0]["state"];
  direction: "left" | "right";
  battle: BattleEntitiesBattle;
  isHidden: boolean;
  isUnderground: boolean;
  isAlfa: boolean;
  cutInEnemie?: CutInEnemieOverlay | null;
  npcBleeding?: boolean;
  purpleHole?: boolean;
  outroResult?: BattleOutroResult | null;
};
