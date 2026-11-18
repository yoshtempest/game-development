import { ONE_THOUSAND_MS } from "@/data/ms";
import type {
  NewPlayerStatus,
  PlayerStatus,
} from "@/utils/types/battle/status";

// Reexportado para manter o import histórico de todo o código que já consumia
// os status daqui; a definição canônica passou a morar em `utils/types`.
export type { NewPlayerStatus, PlayerStatus };

type StatusUntilKey =
  | "bleedUntil"
  | "burnUntil"
  | "poisonUntil"
  | "paralyzedUntil"
  | "blindUntil"
  | "confusedUntil"
  | "frozenUntil";

export const STATUS_UNTIL_FIELD: Record<PlayerStatus, StatusUntilKey> = {
  bleed: "bleedUntil",
  burn: "burnUntil",
  poison: "poisonUntil",
  paralyze: "paralyzedUntil",
  blind: "blindUntil",
  confuse: "confusedUntil",
  freeze: "frozenUntil",
};

export const STATUS_DURATIONS_MS: Record<NewPlayerStatus, number> = {
  burn: 5000,
  poison: 5000,
  paralyze: 2000,
  blind: 2000,
  confuse: 5000,
  freeze: 2000,
};

export const STATUS_LIST: PlayerStatus[] = [
  "bleed",
  "burn",
  "poison",
  "paralyze",
  "blind",
  "confuse",
  "freeze",
];

/**
 * Dano por tick dos DoTs como fração do dano base do NPC da batalha
 * (`getNpcPercentDamage`), para acompanhar o nível dele em vez de ser fixo.
 *
 * As frações foram derivadas do antigo valor fixo (2) no NPC que aplica o
 * status, em dificuldade média, para não mudar o balanceamento atual:
 * - sangramento vem do `hungryDeath` (comum, nível 1, dano base 5) → 2/5;
 * - queimadura/veneno vêm do debuff do `maugrelo` (boss, nível 9, dano
 *   base 38) → 0.05 × 38 ≈ 2.
 */
export const BLEED_TICK_DAMAGE_RATIO = 0.4;
export const BURN_TICK_DAMAGE_RATIO = 0.05;
export const POISON_TICK_DAMAGE_RATIO = 0.05;
export const DOT_TICK_INTERVAL_MS = ONE_THOUSAND_MS;

export function isPlayerFrozen(player: Player): boolean {
  return player.frozenUntil > Date.now();
}

export function isPlayerParalyzed(player: Player): boolean {
  return player.paralyzedUntil > Date.now();
}

export function isPlayerBlind(player: Player): boolean {
  return player.blindUntil > Date.now();
}

export function isPlayerConfused(player: Player): boolean {
  return player.confusedUntil > Date.now();
}

export function isPlayerBurning(player: Player): boolean {
  return player.burnUntil > Date.now();
}

export function isPlayerPoisoned(player: Player): boolean {
  return player.poisonUntil > Date.now();
}

/**
 * Aplica um status no player.
 *
 * Ponto único de entrada: TODA aplicação de status passa por aqui (NPC, cut-in,
 * overlay de treino, armas).
 */
export function applyPlayerStatus(
  player: Player,
  status: NewPlayerStatus,
  durationMs?: number,
): Player {
  const until = Date.now() + (durationMs ?? STATUS_DURATIONS_MS[status]);
  return { ...player, [STATUS_UNTIL_FIELD[status]]: until };
}

export type ActivePlayerStatus = {
  status: PlayerStatus;
  remaining: number;
};

export function getActivePlayerStatuses(player: Player): ActivePlayerStatus[] {
  const now = Date.now();
  const active: ActivePlayerStatus[] = [];

  for (const status of STATUS_LIST) {
    const until = player[STATUS_UNTIL_FIELD[status]];
    if (until > now) {
      active.push({ status, remaining: until - now });
    }
  }

  return active;
}

/** Uma aplicação de status ativa, identificada pelo instante em que termina. */
export type PlayerStatusApplication = {
  status: PlayerStatus;
  until: number;
};

/**
 * Status ativos com o timestamp de fim, em vez do tempo restante.
 *
 * O `until` não muda entre frames de uma mesma aplicação, então serve de
 * identidade estável para efeitos visuais (overlay sorteado por aplicação).
 */
export function getActivePlayerStatusApplications(
  player: Player,
): PlayerStatusApplication[] {
  const now = Date.now();
  const active: PlayerStatusApplication[] = [];

  for (const status of STATUS_LIST) {
    const until = player[STATUS_UNTIL_FIELD[status]];
    if (until > now) {
      active.push({ status, until });
    }
  }

  return active;
}

export function clearPlayerStatuses(player: Player): Player {
  return {
    ...player,
    bleedUntil: 0,
    burnUntil: 0,
    poisonUntil: 0,
    paralyzedUntil: 0,
    blindUntil: 0,
    confusedUntil: 0,
    frozenUntil: 0,
  };
}
