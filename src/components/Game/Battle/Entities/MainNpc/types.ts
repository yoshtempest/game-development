import type { BattleEntitiesBattle } from "@/components/Game/Battle/Entities/types";
import type { CutInEnemieOverlay } from "@/hooks/battle/player/characters/marshadow/useMarshadowCutInEnemie";
import type { BabidiPortalCross } from "@/utils/types/character/babidi";
import { NPCBattle } from "@/components/Game/Entities/Npc/Battle";

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
  /** Travessia em andamento por um portal terrestre (sprite dividido). */
  babidiPortalCross?: BabidiPortalCross | null;
};