/**
 * Tuning da Expansão de Domínio do marcelo.
 *
 * Mora em `data/` (e não em `useDomainExpansion.ts`) porque o efeito de
 * desintegração dos alvos precisa da mesma duração: `src/components/` não
 * deve importar nada de `src/hooks/`.
 */

import { BATTLE_LIMITS } from "@/gameRules/movement/constants";

/** Id do efeito de time da Expansão de Domínio (regra `gameRules/battle/time`). */
export const DOMAIN_EXPANSION_TIME_ID = "marshadow:domainExpansion";
/** Fase preMugetsu (blink visual + teleporte para a ponta mais próxima): 600ms. */
export const DOMAIN_EXPANSION_PRE_MS = 600;
/** Fase mugetsu (sprite mugetsu.svg) antes da varredura: 700ms. */
export const DOMAIN_EXPANSION_MUGETSU_MS = 700;
/** Alguns dos 600ms de preMugetsu: some (preto veio do blink). */
export const DOMAIN_EXPANSION_BLINK_OUT_MS = 300;
/** Fade-in do sprite no local de chegada do teleporte. */
export const DOMAIN_EXPANSION_BLINK_IN_MS = 250;
/** Velocidade da varredura do mugetsuEffect (px lógicos por ms). */
export const DOMAIN_EXPANSION_SWEEP_SPEED = 0.8;
/** Duração da varredura de uma ponta à outra do mapa (950 - 80 = 870px). */
export const DOMAIN_EXPANSION_SWEEP_MS = Math.ceil(
  (BATTLE_LIMITS.maxX - BATTLE_LIMITS.minX) / DOMAIN_EXPANSION_SWEEP_SPEED,
);
/**
 * Duração da desintegração dos alvos tocados: o sprite é picotado em pixels
 * que escurecem com a passagem do mugetsuEffect e depois voam como pó.
 * A habilidade só encerra quando o pó do último alvo termina.
 */
export const DOMAIN_EXPANSION_DISINTEGRATION_MS = 3000;
/** Congelamento total das ações do jogador durante a habilidade. */
export const DOMAIN_EXPANSION_TOTAL_MS =
  DOMAIN_EXPANSION_PRE_MS +
  DOMAIN_EXPANSION_MUGETSU_MS +
  DOMAIN_EXPANSION_SWEEP_MS +
  250 +
  DOMAIN_EXPANSION_DISINTEGRATION_MS;
