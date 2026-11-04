import { memo } from "react";
import { resolveAsset } from "@/utils/paths";
import { getEntityZIndex } from "@/utils/entityDepth";
import { MAP_GRID_COLS, MAP_GRID_ROWS } from "@/data/grid";
import { computeEntityShadow } from "@/utils/shadow/entityShadow";

type Props = {
  gridX: number;
  gridY: number;
  TILE_SIZE: number;
  src: string;
  size?: number;
  fading?: boolean;
  className?: string;
  hidden?: boolean;
  /** Espelha o sprite horizontalmente (para andar para a direita). */
  flipX?: boolean;
  /** Duração do deslize entre tiles; sem ela a posição troca de uma vez. */
  moveMs?: number;
};

/**
 * `memo` porque as props são todas primitivas e a cena re-renderiza a cada
 * passo do jogador: sem o bailout, cada passo refazia `resolveAsset` de todo
 * NPC em campo.
 */
export const NPC = memo(function NPC({
  gridX,
  gridY,
  TILE_SIZE,
  src,
  size,
  fading,
  className,
  hidden,
  flipX,
  moveMs,
}: Props) {
  const mapWidth = TILE_SIZE * MAP_GRID_COLS;
  const mapHeight = TILE_SIZE * MAP_GRID_ROWS;
  const shadow = computeEntityShadow(
    gridX * TILE_SIZE,
    gridY * TILE_SIZE,
    mapWidth,
    mapHeight,
  );

  const spriteSize = TILE_SIZE * (size ?? 1.7);

  return (
    <>
      <img
        src={resolveAsset(src)}
        aria-hidden
        style={{
          position: "absolute",
          width: spriteSize,
          height: spriteSize,
          left: gridX * TILE_SIZE - 40,
          top: gridY * TILE_SIZE - 20,
          zIndex: getEntityZIndex(gridY) - 1,
          opacity: hidden || fading ? 0 : shadow.opacity,
          filter: "brightness(0)",
          transform: `${flipX ? "scaleX(-1) " : ""}translate(${shadow.offsetX}px, ${shadow.offsetY}px) scaleX(${shadow.scaleX}) scaleY(${shadow.scaleY}) skewX(${shadow.skewX}deg)`,
          transformOrigin: "bottom center",
          pointerEvents: "none",
          transition: moveMs
            ? `opacity 1s ease-in, left ${moveMs}ms, top ${moveMs}ms`
            : "opacity 1s ease-in",
        }}
      />
      <img
        src={resolveAsset(src)}
        className={className}
        style={{
          position: "absolute",
          width: spriteSize,
          height: spriteSize,
          left: gridX * TILE_SIZE - 40,
          top: gridY * TILE_SIZE - 20,
          zIndex: getEntityZIndex(gridY),
          // `hidden` corta o fade de propósito: ele marca o sprite fora do mapa,
          // e um efeito de teleport precisa poder nascer/sumir na hora. Já a
          // animação em CSS vence a opacidade inline enquanto roda, então o fim
          // de um `teleportOut`/`teleportIn` não conflita com nada aqui.
          opacity: hidden || fading ? 0 : 1,
          transform: flipX ? "scaleX(-1)" : undefined,
          // O mesmo deslize do jogador (`Entities/Player`): quem anda só troca o
          // tile no estado e deixa o CSS andar os pixels. NPC parado não muda de
          // posição, então a transition só entra quando `moveMs` vem preenchido.
          transition: moveMs
            ? `opacity 1s ease-in, left ${moveMs}ms, top ${moveMs}ms`
            : "opacity 1s ease-in",
        }}
      />
    </>
  );
});
