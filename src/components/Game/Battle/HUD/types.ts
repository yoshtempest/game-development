import type { SummonedNpc } from "@/utils/types/npc/npc";

type BattleHUDState = {
  playerHP: number;
  playerMaxHp: number;
  playerShield: number;
  npcHP: number;
  delicia: number;
  hitsToSpecial: number;
  blockGauge: number;
  blockLimit: number;
  npcBlockGauge: number;
  npcBlockLimit: number;
  energy?: number;
  mana?: number;
  manaMax?: number;
};

type NpcStats = {
  hp: number;
  damage: number;
};

export type BattleHudProps = {
  battle: BattleHUDState;
  npcStats: NpcStats;
  npcType?: string;
  npcLevel?: number;
  summons?: SummonedNpc[];
  allies?: SummonedNpc[];
  isAlfa?: boolean;
  /** Gauge do special do NPC (alfas). undefined = sem special. */
  npcSpecialGauge?: number;
  /** Forma especial ativa (Forma Vastolord): troca a face do HUD do jogador. */
  playerForm?: "vastolordForm";
};