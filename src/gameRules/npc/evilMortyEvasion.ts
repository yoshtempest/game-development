import {
  EVIL_MORTY_SHIELD_CHANCE,
  EVIL_MORTY_TELEPORT_CHANCE,
  toEvilMortyPhase,
} from "@/data/npc/evilMorty";

/**
 * Desfecho da defesa do Evil Morty diante de um golpe do jogador:
 * - `teleport` — some e reaparece atrás do jogador, o golpe vira "miss";
 * - `shield` — o escudo surge e anula o dano inteiro;
 * - `none` — o golpe entra normalmente.
 */
export type EvilMortyEvasion = "teleport" | "shield" | "none";

/**
 * Rola a defesa do Evil Morty para um golpe.
 *
 * O teleporte é rolado primeiro porque é a defesa "de reação" (acontece no
 * instante do golpe); o escudo só é tentado quando ele falha. `random` é
 * injetável para a regra ser determinística fora da batalha.
 */
export function rollEvilMortyEvasion(
  npcPhase: number,
  random: () => number = Math.random,
): EvilMortyEvasion {
  const phase = toEvilMortyPhase(npcPhase);
  if (random() < EVIL_MORTY_TELEPORT_CHANCE[phase]) return "teleport";
  if (random() < EVIL_MORTY_SHIELD_CHANCE[phase]) return "shield";
  return "none";
}
