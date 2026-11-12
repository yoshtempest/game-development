import { effectsPath } from "@/utils/paths";
import { ProjectileConstants } from "@/data/projectile";
import { getViewportSize } from "@/utils/viewport";
import {
  getBossSizeMultiplier,
  getNpcSpriteYOffset,
} from "@/utils/npc/getSpritePath";
import styles from "./styles.module.css";

const FOUR_SVG_ASPECT = 183 / 482;
/** Desvio horizontal do centro para o lado da direção (fração da altura). */
const FACING_OFFSET = 0.18;

type Props = {
  npcX: number;
  npcY: number;
  direction: "left" | "right";
  npcType: string;
  npcPhase: number;
  TILE_SIZE: number;
};

/**
 * Instância do `divergent/four.svg` que surge sobre a Deise durante o dash da
 * fase 2, posicionada no lado para o qual ela está direcionada (esquerda por
 * padrão; espelhada para a direita). Usa a sprite compartilhada em
 * `assets/effects/divergent/`.
 */
export function DeiseDashAfterimage({
  npcX,
  npcY,
  direction,
  npcType,
  npcPhase,
  TILE_SIZE,
}: Props) {
  const scaleX = getViewportSize().width / ProjectileConstants.MAP_WIDTH;
  const scaleY = getViewportSize().height / ProjectileConstants.MAP_HEIGHT;

  const sizeMultiplier = getBossSizeMultiplier(npcType, npcPhase);
  const yOffset = getNpcSpriteYOffset(npcType);

  const height = TILE_SIZE * sizeMultiplier;
  const width = height * FOUR_SVG_ASPECT;
  const facing = direction === "left" ? -1 : 1;
  const left = (npcX + facing * height * FACING_OFFSET) * scaleX;
  const top = npcY * scaleY;

  return (
    <img
      loading="lazy"
      decoding="async"
      src={effectsPath("/divergent/four.svg")}
      className={styles.afterimage}
      draggable={false}
      style={{
        position: "absolute",
        width,
        height,
        left,
        top,
        zIndex: 9,
        pointerEvents: "none",
        transform: `translate(-50%, calc(-100% + ${yOffset * 100}%)) scaleX(${
          direction === "right" ? -1 : 1
        })`,
      }}
    />
  );
}
