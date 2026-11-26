import {
  TWO_HUNDRED_FIFTY_MS,
  THREE_HUNDRED_MS,
  FOUR_HUNDRED_FIFTY_MS,
  EIGHT_HUNDRED_MS,
} from "@/data/ms";

export const GRID_STEP = 1;
export const BATTLE_STEP = 10;
export const DASH_STEP = 25;
export const DASH_DURATION = THREE_HUNDRED_MS;
export const DASH_INTERVAL = 30;

export const NPC_BASE_SPEED = 2;
export const NPC_RUNNING_SPEED = 4;

export const BATTLE_LIMITS = {
  minX: 80,
  maxX: 950,
};

export const BLOCK_ATTACK_PUSH_DISTANCE = 20;

export const PLAYER_JUMP_FORCE = -16;

export const JUMP_DURATION = FOUR_HUNDRED_FIFTY_MS;

export const ATTACK_DURATION = TWO_HUNDRED_FIFTY_MS;
export const SPECIAL_DURATION = EIGHT_HUNDRED_MS;

/**
 * Física vertical do NPC em mapa de batalha com obstáculos. Mesmo impulso e
 * mesma gravidade do player (`PLAYER_JUMP_FORCE` / `gravity` do `useGravity`)
 * de propósito: o NPC alcança exatamente as plataformas que o player alcança,
 * então nenhum mapa vira esconderijo inalcançável nem o NPC sobe onde o
 * player não consegue.
 */
export const NPC_JUMP_FORCE = PLAYER_JUMP_FORCE;
export const NPC_GRAVITY = 1;
