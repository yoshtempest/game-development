import {
  STAFF_COOLDOWN,
  SUMMON_COOLDOWN,
  MIN_ACTION_GAP,
} from "@/data/cooldowns";
import {
  FIFTY_MS,
  SIX_HUNDRED_MS,
  THREE_THOUSAND_MS,
  TWO_HUNDRED_FIFTY_MS,
} from "@/data/ms";

export { STAFF_COOLDOWN, SUMMON_COOLDOWN, MIN_ACTION_GAP };

export const CLOSE_RANGE = 200;

/** Duração da arrancada (pitch) antes do dash na fase 2. */
export const DASH_WIND_UP_MS = SIX_HUNDRED_MS;
/** Duração total do trajeto do dash, de um lado ao outro da arena. */
export const DASH_DURATION_MS = THREE_THOUSAND_MS;
/** Distância de contato em que a Deise empurra/causa dano no jogador. */
export const DASH_CONTACT_RANGE = 60;
/** Intervalo de tentativa de dano enquanto o contato com o jogador persiste. */
export const DASH_DAMAGE_INTERVAL_MS = TWO_HUNDRED_FIFTY_MS;
/** Gap à frente da Deise onde o jogador é arrastado no contato. */
export const DASH_PUSH_GAP = 40;
/** Tempo ocioso sem atacar depois de chegar na outra ponta (janela de dano). */
export const DASH_POST_IDLE_MS = THREE_THOUSAND_MS;
/** Cooldown entre um dash e o próximo. */
export const DASH_COOLDOWN = THREE_THOUSAND_MS;
/**
 * Maior intervalo entre dois ticks da IA (20ms) que ainda conta como tempo de
 * dash. Um intervalo maior significa que a IA não rodou — batalha pausada,
 * mundo congelado por habilidade, stagger ou a sequência do O Abençoado — e o
 * trajeto não pode avançar por esse tempo, senão a Deise "teleporta" ao
 * retomar.
 */
export const DASH_MAX_TICK_GAP_MS = FIFTY_MS;

export type DeiseAI = {
  knownPhase: number;
  lastStaffThrow: number;
  lastSummon: number;
  lastAction: number;
  dashState: "idle" | "windUp" | "dashing" | "postDash";
  dashStart: number;
  dashStartX: number;
  dashDirection: "left" | "right";
  dashEndX: number;
  /** Tempo de dash efetivamente simulado (só ticks em que a IA rodou). */
  dashElapsed: number;
  /** Instante do último tick do dash, para medir o delta do próximo. */
  lastDashTick: number;
  lastDash: number;
  lastDashDamage: number;
  postDashStart: number;
};

export function initDeiseAi(npcPhase: number): DeiseAI {
  const now = Date.now();
  return {
    knownPhase: npcPhase,
    lastStaffThrow: now - STAFF_COOLDOWN,
    lastSummon: now,
    lastAction: now - MIN_ACTION_GAP,
    dashState: "idle",
    dashStart: 0,
    dashStartX: 0,
    dashDirection: "left",
    dashEndX: 0,
    dashElapsed: 0,
    lastDashTick: 0,
    lastDash: now,
    lastDashDamage: 0,
    postDashStart: 0,
  };
}

export function handlePhaseChange(ai: DeiseAI, npcPhase: number): DeiseAI {
  ai.knownPhase = npcPhase;
  ai.lastStaffThrow = 0;
  ai.lastSummon = 0;
  ai.lastAction = 0;
  ai.dashState = "idle";
  ai.dashStart = 0;
  ai.dashStartX = 0;
  ai.dashElapsed = 0;
  ai.lastDashTick = 0;
  ai.lastDash = 0;
  ai.lastDashDamage = 0;
  ai.postDashStart = 0;
  return ai;
}
