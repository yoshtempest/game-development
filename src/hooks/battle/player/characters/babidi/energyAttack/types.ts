import type { BabidiTarget } from "@/utils/types/character/babidi";

export type Props = {
  PLAYER_SIZE: number;
  timeRef: React.RefObject<TimeEffect[]>;
  npc: { x: number; y: number };
  npcClass: NPCClass;
  summons: SummonedNpc[];
  /** Colisão do projétil com um alvo: resolve o dano básico (main ou summon). */
  onProjectileHit: (target: BabidiTarget) => void;
};
