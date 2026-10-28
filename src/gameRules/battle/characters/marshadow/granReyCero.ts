/**
 * Geometria do "Gran Rey Cero" do marshadow: quanto a lâmina avançou, o que ela
 * toca e onde o sprite deve ser desenhado.
 *
 * Mora em `gameRules/` (e não em `useGranReyCero.ts`) porque tanto o hook que
 * move a lâmina quanto o componente que a desenham precisam da mesma conta —
 * `src/components/` não deve importar nada de `src/hooks/`.
 */

import {
  GRAN_REY_CERO_AOE_RADIUS,
  GRAN_REY_CERO_CREEP_PX_PER_S,
  GRAN_REY_CERO_EFFECT_HEIGHT,
  GRAN_REY_CERO_PLAYER_SPRITE_RATIO,
  GRAN_REY_CERO_TRAVEL_DISTANCE,
  GRAN_REY_CERO_TRAVEL_MS,
} from "@/data/characters/marshadow/granReyCero";

/** Velocidade da "corrida" (sem alvo), em px por ms. */
export const GRAN_REY_CERO_TRAVEL_SPEED =
  GRAN_REY_CERO_TRAVEL_DISTANCE / GRAN_REY_CERO_TRAVEL_MS;

/** Velocidade do rastejo (com alvo), em px por ms. */
export const GRAN_REY_CERO_CREEP_SPEED = GRAN_REY_CERO_CREEP_PX_PER_S / 1000;

/**
 * Quantos px a lâmina avançou, somando corrida e rastejo. O teto é o fim do
 * caminho: se as 10 instâncias fecharem antes de a lâmina percorrer os 500px,
 * ela ainda some aqui — com o alvo empurrado, não com a lâmina atravessada.
 */
export function granReyCeroDistance(travelMs: number, creepMs: number): number {
  return Math.min(
    GRAN_REY_CERO_TRAVEL_DISTANCE,
    travelMs * GRAN_REY_CERO_TRAVEL_SPEED + creepMs * GRAN_REY_CERO_CREEP_SPEED,
  );
}

/**
 * A lâmina encostou? O raio é medido a partir da PONTA DE CORTE (não do centro
 * do sprite): o inimigo é atingido quando chega perto da aresta que está
 * avançando, e o mesmo raio vale para os inimigos que a lâmina apenas
 * atravessa.
 */
export function granReyCeroHits(
  tipX: number,
  tipY: number,
  targetX: number,
  targetY: number,
): boolean {
  return Math.hypot(tipX - targetX, tipY - targetY) <= GRAN_REY_CERO_AOE_RADIUS;
}

/** Altura renderizada do sprite do marshadow em px lógicos, dado o tile. */
export function granReyCeroPlayerSpriteHeight(playerSize: number): number {
  return playerSize * GRAN_REY_CERO_PLAYER_SPRITE_RATIO;
}

/** y do topo da lâmina: centralizada no sprite do marshadow. */
export function granReyCeroEffectTop(tipY: number, playerSize: number): number {
  const spriteHeight = granReyCeroPlayerSpriteHeight(playerSize);
  return tipY - spriteHeight / 4 - GRAN_REY_CERO_EFFECT_HEIGHT / 4;
}

export type GranReyCeroEffect = {
  /** Ponta de corte (px lógicos): o ponto que viaja e define o raio. */
  tipX: number;
  /** y do jogador no instante do disparo (pés). */
  tipY: number;
  /** +1 ou -1: para onde a lâmina aponta. */
  dirX: number;
  /** true na fase final: a lâmina não causa mais dano, só desvanece. */
  fading: boolean;
};
