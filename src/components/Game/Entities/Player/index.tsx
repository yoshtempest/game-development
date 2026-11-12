import { memo } from "react";
import { playerPath } from "@/utils/paths";
import { EXPLORE_MOVE_INTERVAL } from "@/gameRules/movement/explore";
import { HEIGHT_STEP_OFFSET } from "@/gameRules/movement/levels";
import { getEntityZIndex } from "@/utils/entityDepth";
import { MAP_GRID_COLS, MAP_GRID_ROWS } from "@/data/grid";
import { computeEntityShadow } from "@/utils/shadow/entityShadow";
import { LevelUpParticles } from "@/components/Game/LevelUpParticles";
import { ProfessionBadge } from "@/components/Game/ProfessionBadge";
import { motion } from "motion/react";

type Props = {
  character: CharacterId;
  direction: Direction;
  gridX: number;
  gridY: number;
  height?: number;
  TILE_SIZE: number;
  PLAYER_SIZE: number;
  hasPeru?: boolean;
  moving?: boolean;
};

/**
 * `memo`: a cena de exploração re-renderiza a cada passo e as props do
 * jogador são todas primitivas — sem o bailout, `LevelUpParticles` e
 * `ProfessionBadge` remontavam junto a cada tile andado.
 */
export const Player = memo(function Player({
  character,
  direction,
  gridX,
  gridY,
  height = 0,
  TILE_SIZE,
  PLAYER_SIZE,
  hasPeru,
  moving,
}: Props) {
  const spriteDirection = direction === "left" ? "right" : direction;
  const spriteName = moving
    ? `moving${spriteDirection.charAt(0).toUpperCase() + spriteDirection.slice(1)}`
    : spriteDirection;

  const spritePath = hasPeru
    ? `/${character}/movement/withPeru/${spriteName}.svg`
    : `/${character}/movement/${spriteName}.svg`;

  const src = playerPath(spritePath);

  const mapWidth = TILE_SIZE * MAP_GRID_COLS;
  const mapHeight = TILE_SIZE * MAP_GRID_ROWS;
  const entityX = gridX * TILE_SIZE * 1.2;
  const entityY = gridY * TILE_SIZE - height * TILE_SIZE * HEIGHT_STEP_OFFSET;
  const shadow = computeEntityShadow(entityX, entityY, mapWidth, mapHeight);

  return (
    <>
      <div
        aria-hidden
        style={{
          position: "absolute",
          width: PLAYER_SIZE,
          height: PLAYER_SIZE,
          left: gridX * TILE_SIZE - 11,
          top: gridY * TILE_SIZE - (PLAYER_SIZE - TILE_SIZE - gridY),
          transform: `translate(-10%, -20%) scaleX(${direction === "left" ? -1 : 1})`,
          zIndex: getEntityZIndex(gridY) - 1,
          transition: `left ${EXPLORE_MOVE_INTERVAL}ms, top ${EXPLORE_MOVE_INTERVAL}ms`,
          pointerEvents: "none",
        }}
      >
        <img
          loading="lazy"
          decoding="async"
          src={src}
          style={{
            width: "100%",
            height: "100%",
            filter: "brightness(0)",
            opacity: shadow.opacity,
            transform: `translate(${shadow.offsetX}px, ${shadow.offsetY}px) scaleX(${shadow.scaleX}) scaleY(${shadow.scaleY}) skewX(${shadow.skewX}deg)`,
            transformOrigin: "bottom center",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          width: PLAYER_SIZE,
          height: PLAYER_SIZE,
          left: gridX * TILE_SIZE - 11,
          top: gridY * TILE_SIZE - height * TILE_SIZE * HEIGHT_STEP_OFFSET,
          transform: `translate(-10%, -20%) scaleX(${direction === "left" ? -1 : 1})`,
          zIndex: getEntityZIndex(gridY),
          transition: `left ${EXPLORE_MOVE_INTERVAL}ms, top ${EXPLORE_MOVE_INTERVAL}ms`,
        }}
      >
        <motion.img
          src={src}
          animate={
            moving
              ? {
                  y: 0,
                  rotate: 0,
                  scaleY: 1,
                }
              : {
                  y: [0, 1, 0],
                  x: [0, 1, 0],
                  rotate: [0, 0.5, 0, -0.5, 0],
                  scaleY: [1, 1.005, 1],
                }
          }
          transition={
            moving
              ? {
                  duration: 0.15,
                  ease: "easeOut",
                }
              : {
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
        <LevelUpParticles character={character} size={PLAYER_SIZE} />
        <ProfessionBadge />
      </div>
    </>
  );
});
