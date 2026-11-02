

import type {
  BabidiPortalWarpFn,
  BabidiTarget,
} from "@/utils/types/character/babidi";

export type Props = {
  PLAYER_SIZE: number;
  timeRef: React.RefObject<TimeEffect[]>;
  npc: { x: number; y: number };
  npcClass: NPCClass;
  summons: SummonedNpc[];
  /** Colisão do projétil com um alvo: resolve o dano básico (main ou summon). */
  onProjectileHit: (target: BabidiTarget) => void;
  /** Portais do babidi: faz o projétil de energia atravessar de um ao outro. */
  portalWarpRef?: React.RefObject<BabidiPortalWarpFn | null>;
};
