import type {
  DamageArmor,
  DamageKind,
} from "@/utils/types/battle/damageKind";
import type { NewPlayerStatus } from "@/gameRules/battle/status/statusEffects";
import type { NpcTarget } from "@/gameRules/battle/npc/targeting";
import type { ElementType } from "@/utils/types/battle/element";

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

/** Lado da arena no duelo: quem convidou nasce à esquerda. */
export type PvpSide = "left" | "right";

/**
 * Atributos defensivos do oponente no PvP. No duelo o NPC local é só um
 * *proxy* do outro jogador, então o funil de dano do atacante precisa da
 * armadura, do HP máximo e da tipagem **dele** — não das do dummy que ocupa o
 * slot do NPC.
 */
export type PvpOpponentStats = {
  maxHp: number;
  armor: DamageArmor;
  elementTypes: readonly ElementType[];
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
  /** Duelo PvP: o NPC local é o proxy do oponente (sem IA, sem recompensa). */
  pvp: boolean;
  pvpSide: PvpSide;
  /** Override do NPC no funil de dano enquanto o oponente for conhecido. */
  pvpOpponent: PvpOpponentStats | null;
  /**
   * Avisa a partida que o jogador local caiu no round. Ref porque o controle
   * da partida (`usePvpMatch`) só existe depois da cena montada.
   */
  pvpDownRef: { current: () => void };
};
