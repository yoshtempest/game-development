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

export const BURN_TICK_DAMAGE = 2;
export const POISON_TICK_DAMAGE = 2;
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
 * Diz se o player está imune ao status (poção de resistência ativa).
 *
 * Lido por `applyPlayerStatus` e pelo sangramento, que é o único status
 * aplicado fora dele — os dois precisam consultar a mesma fonte.
 */
export function isPlayerImmuneTo(player: Player, status: PlayerStatus): boolean {
  return (player.statusImmuneUntil?.[status] ?? 0) > Date.now();
}

/**
 * Aplica uma poção de resistência: cura os status listados que estiverem
 * ativos e deixa o player imune a eles por `durationMs`.
 *
 * Curar junto com a imunidade é o que faz a poção servir de "remédio" no meio
 * da luta, e não só de prevenção antes dela.
 */
export function grantStatusResistance(
  player: Player,
  statuses: readonly PlayerStatus[],
  durationMs: number,
): Player {
  const until = Date.now() + durationMs;
  const immune = { ...player.statusImmuneUntil };
  const cleared: Partial<Record<StatusUntilKey, number>> = {};
  for (const status of statuses) {
    immune[status] = Math.max(immune[status] ?? 0, until);
    cleared[STATUS_UNTIL_FIELD[status]] = 0;
  }
  return { ...player, ...cleared, statusImmuneUntil: immune };
}

/**
 * Aplica um status no player.
 *
 * Ponto único de entrada: TODA aplicação de status passa por aqui (NPC, cut-in,
 * overlay de treino, armas). Por isso a imunidade de poção é checada aqui —
 * devolve o mesmo objeto quando o player está imune, sem reiniciar o timer.
 */
export function applyPlayerStatus(
  player: Player,
  status: NewPlayerStatus,
  durationMs?: number,
): Player {
  if (isPlayerImmuneTo(player, status)) return player;
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
