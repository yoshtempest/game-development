import { TIME_POLICE_SPAWN_CHANCE } from "@/data/battle/timePolice";

/**
 * Sorteia se a Polícia do Tempo aparece neste retrocesso.
 *
 * O gerador é injetável para a regra continuar pura e testável; o padrão é
 * `Math.random`, chamado no evento do retrocesso (nunca no render).
 */
export function rollTimePolice(
  random: () => number = Math.random,
  chance: number = TIME_POLICE_SPAWN_CHANCE,
): boolean {
  return random() < chance;
}
