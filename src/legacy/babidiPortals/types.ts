/**
 * Tipos da mecânica arquivada de portais do babidi.
 *
 * A habilidade ativa hoje é a versão simples (portal aéreo + bomba); estes
 * tipos ficam aqui para uma futura reativação dos dois portais e do
 * teletransporte sem depender do código ativo.
 */

/** Forma do portal: deitado no chão, em pé (frontal) ou suspenso (aéreo). */
export type BabidiPortalKind = "ground" | "default" | "air";

/** Fase do portal: voando da mão até o destino, ou já fixo no mapa. */
export type BabidiPortalPhase = "flying" | "placed";

export type BabidiPortalWarpFn = (
  id: string,
  x: number,
  y: number,
) => { x: number; y: number; kind: BabidiPortalKind } | null;

export type BabidiPortal = {
  id: string;
  kind: BabidiPortalKind;
  phase: BabidiPortalPhase;
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  startTime: number;
  cost: number;
};

export type BabidiPortalCross = {
  depth: number;
  destX: number;
  destY: number;
};

export type BabidiPortalGhost = {
  kind: BabidiPortalKind;
  x: number;
  y: number;
};

export type BabidiPortalFocus = { x: number; y: number } | null;
