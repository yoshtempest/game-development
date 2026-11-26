/**
 * Física do voo da Genki Dama do Ematron: gravidade + resistência do ar
 * (arrasto linear) com solução analítica.
 *
 * A trajetória é resolvida em forma fechada, e não por integração passo a
 * passo, por dois motivos: (1) o `setInterval` de 16ms do hook não é estável
 * (aba em segundo plano, pause), e a posição só depende do tempo decorrido; (2)
 * a velocidade inicial é calculada para que a esfera chegue EXATAMENTE no alvo
 * em `durationMs`, então o arco nunca erra a área de dano.
 *
 * Equações (y cresce para baixo, gravidade `g` positiva, arrasto `k`):
 *   x(t) = x0 + vx0 · (1 - e^(-k·t)) / k
 *   y(t) = y0 + (vy0 - g/k) · (1 - e^(-k·t)) / k + g·t / k
 */

import {
  GENKI_DAMA_AIR_DRAG_PER_S,
  GENKI_DAMA_GRAVITY_PX_S2,
} from "@/data/characters/ematron";

/** Parâmetros de um lançamento já resolvido (velocidades em px/s). */
export type GenkiDamaLaunch = {
  fromX: number;
  fromY: number;
  vx0: number;
  vy0: number;
  gravity: number;
  drag: number;
  durationMs: number;
};

/** Posição da esfera num instante do voo, e se o voo terminou. */
export type GenkiDamaFlightPoint = {
  x: number;
  y: number;
  done: boolean;
};

/**
 * Fração `(1 - e^(-k·t)) / k` — o deslocamento acumulado por unidade de
 * velocidade inicial sob arrasto linear. Cai para `t` quando `k → 0` (sem ar),
 * o que evita divisão por zero se o arrasto for zerado no balanceamento.
 */
function dragDisplacement(drag: number, tSec: number): number {
  if (drag <= 0) return tSec;
  return (1 - Math.exp(-drag * tSec)) / drag;
}

/**
 * Resolve a velocidade inicial que leva a esfera de `(fromX, fromY)` até
 * `(toX, toY)` em `durationMs` sob gravidade e arrasto. Como a gravidade puxa
 * para baixo durante o voo, a velocidade vertical inicial sai para cima e o
 * caminho vira um arco.
 */
export function createGenkiDamaLaunch(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  durationMs: number,
  gravity: number = GENKI_DAMA_GRAVITY_PX_S2,
  drag: number = GENKI_DAMA_AIR_DRAG_PER_S,
): GenkiDamaLaunch {
  const tSec = Math.max(durationMs, 1) / 1000;
  const disp = dragDisplacement(drag, tSec);
  const vx0 = (toX - fromX) / disp;
  const gravityDrift =
    drag <= 0 ? (gravity * tSec * tSec) / 2 : (gravity / drag) * (tSec - disp);
  const vy0 = (toY - fromY - gravityDrift) / disp;
  return { fromX, fromY, vx0, vy0, gravity, drag, durationMs };
}

/**
 * Passo da física: posição da esfera `elapsedMs` depois do lançamento. Depois
 * de `durationMs` devolve o próprio alvo com `done: true` — é o instante da
 * explosão.
 */
export function stepGenkiDamaFlight(
  launch: GenkiDamaLaunch,
  elapsedMs: number,
): GenkiDamaFlightPoint {
  const clampedMs = Math.min(Math.max(elapsedMs, 0), launch.durationMs);
  const tSec = clampedMs / 1000;
  const { fromX, fromY, vx0, vy0, gravity, drag } = launch;
  const disp = dragDisplacement(drag, tSec);
  const gravityDrift =
    drag <= 0 ? (gravity * tSec * tSec) / 2 : (gravity / drag) * (tSec - disp);
  return {
    x: fromX + vx0 * disp,
    y: fromY + vy0 * disp + gravityDrift,
    done: elapsedMs >= launch.durationMs,
  };
}
