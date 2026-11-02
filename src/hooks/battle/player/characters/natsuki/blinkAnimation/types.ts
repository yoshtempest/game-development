export type BlinkVisual = {
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  direction: Direction;
  state: PlayerState;
  /** true quando o teleporte aconteceu: o jogador surge no destino com silhueta branca. */
  teleported: boolean;
};
