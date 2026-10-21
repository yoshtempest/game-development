/**
 * Geometria do feixe de Laser da Forma Vastolord: onde o feixe começa e
 * termina em px lógicos, e onde o sprite deve ser desenhado.
 *
 * Mora em `gameRules/` (e não em `useVastolordLaser.ts`) porque tanto o hook
 * que dispara o feixe quanto o componente que o desenham precisam da mesma
 * conta — `src/components/` não deve importar nada de `src/hooks/`.
 */

import { VASTOLORD_LASER_BEAM_HEIGHT } from "@/data/characters/marcelo/marshadowLaser";
import { PLAYER_SPRITE_DIVISOR } from "@/data/grid";

/**
 * Altura renderizada do sprite do marcelo em px lógicos, dado o tamanho do
 * tile. Tem de ser a MESMA conta de `getPlayerDimensions` (o componente do
 * player), senão o feixe nasce fora do personagem: o `y` do player e o pe do
 * sprite (`translate(-50%, -100%)`), e o feixe tem de entrar na altura de
 * verdade, nao numa altura inventada aqui.
 */
export function vastolordPlayerSpriteHeight(playerSize: number): number {
  return playerSize / PLAYER_SPRITE_DIVISOR;
}

/**
 * y do topo do feixe: centralizado no sprite do marcelo.
 *
 * `beamY` e o y do player (o chao/pe), entao o centro do sprite fica
 * `spriteHeight / 2` acima dele e o centro do feixe coincide com esse centro.
 */
export function vastolordLaserTop(beamY: number, playerSize: number): number {
  const spriteHeight = vastolordPlayerSpriteHeight(playerSize);
  return beamY - spriteHeight / 2 - VASTOLORD_LASER_BEAM_HEIGHT / 1.5;
}

export type VastolordLaserBeam = {
  /** Limite esquerdo do feixe (px lógicos): 0 ou o x do jogador. */
  fromX: number;
  /** Limite direito do feixe (px lógicos): o x do jogador ou a largura do mapa. */
  toX: number;
  /** y do jogador no instante do disparo (pés) — centro do feixe = centro do sprite acima dele. */
  y: number;
  /** Fase visual para animações: 'starting' cresce, 'active' mantém, 'ending' encolhe/fade. */
  phase: "starting" | "active" | "ending";
};
