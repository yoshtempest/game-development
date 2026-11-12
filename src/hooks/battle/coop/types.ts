import type { DamageKind } from "@/utils/types/battle/damageKind";
import type { NewPlayerStatus } from "@/gameRules/battle/status/statusEffects";
import type { NpcTarget } from "@/gameRules/battle/npc/targeting";

/**
 * Natureza do golpe do NPC que chega ao dono do alvo remoto. O líder decide
 * *que* golpe acertou; o cliente do alvo resolve armadura, esquiva, bloqueio e
 * status com os próprios dados.
 */
export type NpcHitSource =
  | "melee"
  | "ranged"
  | "burst"
  | "fixed"
  | "laser"
  | "throw"
  | "unblockable"
  | "status"
  | "push"
  | "pull"
  | "ram"
  | "grab"
  | "throwStart"
  | "drag";

export type NpcHitIntent = {
  /** Jogador que deve resolver o golpe. */
  to: string;
  source: NpcHitSource;
  multiplier?: number;
  damageKind?: DamageKind;
  /** Dano absoluto de golpes fixos (laser, drag, explosões). */
  amount?: number;
  /** Golpe de área: acerta todos os jogadores vivos (groundPapers, laser…). */
  area?: boolean;
  /** Empurrão do burst/laser (direção em x). */
  pushDir?: number;
  /** Posição do NPC que gerou o push/pull/laser. */
  npcX?: number;
  npcY?: number;
  /** Destino do ram. */
  toX?: number;
  direction?: "left" | "right";
  flipped?: boolean;
  status?: NewPlayerStatus;
};

/**
 * Contrato entre a cena e a rede. `authoritative` só é true no líder: o guest
 * não roda IA nem simula projéteis, apenas espelha o NPC e resolve os golpes
 * que chegam para ele.
 */
export type BattleCoop = {
  /**
   * Batalha 2v1 de verdade (online, fora do PvP, com parceiro de guilda na
   * arena). Só com ela ligada a morte vira espectador em vez de derrota.
   */
  active: boolean;
  authoritative: boolean;
  localPlayerId: string;
  remoteTarget: NpcTarget | null;
  /** O outro jogador ainda está de pé (define espectador × derrota). */
  remoteAlive: boolean;
  sendNpcHit: (hit: NpcHitIntent) => void;
};
