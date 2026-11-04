/**
 * Configuração global da fonte de luz: centro superior do mapa.
 * Toda entidade projeta sua sombra na direção oposta a essa fonte.
 */
export const LIGHT_SOURCE = {
  xRatio: 0.5,
  yRatio: 0,
} as const;

export type ShadowTransform = {
  offsetX: number;
  offsetY: number;
  scaleX: number;
  scaleY: number;
  skewX: number;
  opacity: number;
};

/**
 * Calcula os ajustes (escala, posição, opacidade) da sombra de uma entidade
 * com base na sua posição relativa à fonte de luz (centro superior do mapa).
 *
 * Quanto mais distante da luz, mais alongada e mais transparente a sombra.
 */
export function computeEntityShadow(
  x: number,
  y: number,
  mapWidth: number,
  mapHeight: number,
): ShadowTransform {
  const lightX = mapWidth * LIGHT_SOURCE.xRatio;
  const lightY = mapHeight * LIGHT_SOURCE.yRatio;

  const dx = x - lightX;
  const dy = Math.max(1, y - lightY);

  const normX = mapWidth > 0 ? dx / mapWidth : 0;
  const normY = mapHeight > 0 ? dy / mapHeight : 0;
  const distance = Math.min(1, Math.hypot(normX, normY));

  return {
    offsetX: normX * 24,
    offsetY: 6 + normY * 8,
    scaleX: 1 + normY * 0.35,
    scaleY: 0.32,
    skewX: normX * -14,
    opacity: 0.42 - distance * 0.18,
  };
}