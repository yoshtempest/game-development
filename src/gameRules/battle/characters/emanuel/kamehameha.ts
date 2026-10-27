/**
 * Geometria do feixe de Kamehameha do Emanuel: onde o feixe começa e termina em
 * px lógicos, e onde o sprite deve ser desenhado.
 *
 * Mora em `gameRules/` (e não em `useKamehameha.ts`) porque tanto o hook que
 * dispara o feixe quanto o componente que o desenham precisam da mesma conta —
 * `src/components/` não deve importar nada de `src/hooks/`.
 */

import { EMANUEL_KAMEHAMEHA_BEAM_HEIGHT } from "@/data/characters/emanuel/emanuel";
import { PLAYER_SPRITE_DIVISOR } from "@/data/grid";

/**
 * Altura renderizada do sprite do Emanuel em px lógicos, dado o tamanho do
 * tile. Tem de ser a MESMA conta de `getPlayerDimensions` (o componente do
 * player), senão o feixe nasce fora do personagem.
 */
export function emanuelPlayerSpriteHeight(playerSize: number): number {
  return playerSize / PLAYER_SPRITE_DIVISOR;
}

/**
 * y do topo do feixe: centralizado no sprite do Emanuel.
 *
 * `beamY` é o y do player (o chão/pe), então o centro do sprite fica
 * `spriteHeight / 2` acima dele e o centro do feixe coincide com esse centro.
 * O feixe tem 178px de altura, centrado no y do player (de -89 a +89px em
 * torno do chão do player), para atingir inimigos no mesmo nível.
 */
export function kamehamehaTop(beamY: number): number {
  return beamY - EMANUEL_KAMEHAMEHA_BEAM_HEIGHT / 2;
}

export type KamehamehaEffect = {
  /** Limite esquerdo do feixe (px lógicos): 0 ou o x do jogador. */
  fromX: number;
  /** Limite direito do feixe (px lógicos): o x do jogador ou a largura do mapa. */
  toX: number;
  /** y do jogador no instante do disparo (pés) — centro do feixe = centro do sprite acima dele. */
  y: number;
  /** Fase visual para animações: 'starting' cresce, 'active' mantém, 'ending' encolhe/fade. */
  phase: "starting" | "active" | "ending";
};
