/**
 * Números do Evil Morty (issue #225) que mais de uma camada lê: a regra de
 * esquiva (`gameRules/npc/evilMortyEvasion.ts`) e a IA
 * (`services/npc/attacks/evilMorty/`). Os timings que só a IA usa ficam no
 * `state.ts` dela.
 */

/** Fases do Evil Morty: entediado, sério e irritado. */
export type EvilMortyPhase = 1 | 2 | 3;

/**
 * Chance de teleportar para trás do jogador no instante em que ia ser
 * acertado — o golpe vira "miss". A issue fixa 20% nas fases 1 e 2 e 30% na 3.
 */
export const EVIL_MORTY_TELEPORT_CHANCE: Record<EvilMortyPhase, number> = {
  1: 0.2,
  2: 0.2,
  3: 0.3,
};

/**
 * Chance do escudo surgir e anular o golpe inteiro (20% / 50% / 70%).
 *
 * Só é rolada quando o teleporte não aconteceu: as duas defesas são
 * excludentes, então a chance real de o golpe não entrar na fase 3 é
 * 0.3 + 0.7 × 0.7 ≈ 79%. Decisão para revisar: a issue não diz se as chances
 * somam ou se o escudo só entra quando o teleporte falha.
 */
export const EVIL_MORTY_SHIELD_CHANCE: Record<EvilMortyPhase, number> = {
  1: 0.2,
  2: 0.5,
  3: 0.7,
};

/**
 * Multiplicador sobre a velocidade de perseguição padrão de NPC.
 *
 * A issue pede "1.5× / 1.75× a velocidade do jogador", mas o jogador anda por
 * passos de tecla (`BATTLE_STEP`) e o NPC por tick (`getChaseMovement`), então
 * não existe uma unidade comum. Decisão para revisar: aplicar o fator sobre a
 * velocidade de perseguição do NPC.
 */
export const EVIL_MORTY_SPEED: Record<EvilMortyPhase, number> = {
  1: 1.5,
  2: 1.5,
  3: 1.75,
};

/** Distância (px) atrás do jogador onde ele reaparece ao esquivar. */
export const EVIL_MORTY_TELEPORT_OFFSET = 70;

/** Normaliza a fase vinda do sistema de batalha para as três do Evil Morty. */
export function toEvilMortyPhase(npcPhase: number): EvilMortyPhase {
  if (npcPhase >= 3) return 3;
  if (npcPhase === 2) return 2;
  return 1;
}
