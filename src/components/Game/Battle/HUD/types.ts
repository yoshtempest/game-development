import type { CharacterId } from "@/data/characters/list";
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

/** Oponente do duelo PvP, exibido no painel que normalmente é do NPC. */
export type BattleHudOpponent = {
  name: string;
  character: CharacterId;
  level: number;
  maxHp: number;
};

/** Parceiro do co-op 2v1, com a barra exibida abaixo do jogador local. */
export type BattleHudPartner = {
  name: string;
  character: CharacterId;
  hp: number;
  maxHp: number;
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
  /** Escudo Machine Gama (vida extra) do Babidi. */
  machineGamaShield?: number;
  machineGamaShieldMax?: number;
  opponent?: BattleHudOpponent | null;
  partner?: BattleHudPartner | null;
};
