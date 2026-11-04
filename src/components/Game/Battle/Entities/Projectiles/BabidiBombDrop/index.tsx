import type { CSSProperties } from "react";

import {
  npcPathProjectile,
  playerAbilityPath,
  playerProjectilePath,
} from "@/utils/paths";
import { BabidiBombDropConstants } from "@/data/characters/babidi";
import type { BabidiBombDropVisual } from "@/utils/types/character/babidi";

import styles from "./styles.module.css";

type Props = {
  visual: BabidiBombDropVisual | null;
  battleScaleX: number;
  battleScaleY: number;
};

/** Portal aéreo, bomba caindo e explosão da Energia Dimensional do babidi. */
export function BabidiBombDrop({
  visual,
  battleScaleX,
  battleScaleY,
}: Props) {
  if (!visual) return null;

  const fallDistance = (visual.targetY - visual.portalY) * battleScaleY;
  const sizes = {
    "--portal-size": `${BabidiBombDropConstants.PORTAL_SIZE}px`,
    "--bomb-size": `${BabidiBombDropConstants.BOMB_SIZE}px`,
    "--explosion-size": `${BabidiBombDropConstants.EXPLOSION_SIZE}px`,
  } as CSSProperties;

  return (
    <>
      {visual.phase !== "exploding" && (
        <div
          className={styles.portal}
          style={{
            ...sizes,
            left: visual.targetX * battleScaleX,
            top: visual.portalY * battleScaleY,
          }}
        >
          <img
            src={playerAbilityPath("babidi", "portals", "airPortal.svg")}
            alt=""
          />
        </div>
      )}

      {visual.phase === "falling" && (
        <img
          className={styles.bomb}
          src={playerProjectilePath("/babidiBomb.svg")}
          alt=""
          style={{
            ...sizes,
            left: visual.targetX * battleScaleX,
            top: visual.targetY * battleScaleY,
            "--fall-distance": `${fallDistance}px`,
            animationDuration: `${BabidiBombDropConstants.FALL_MS}ms`,
          } as CSSProperties}
        />
      )}

      {visual.phase === "exploding" && (
        <img
          className={styles.explosion}
          src={npcPathProjectile("/explosion.svg")}
          alt=""
          style={{
            ...sizes,
            left: visual.targetX * battleScaleX,
            top: visual.targetY * battleScaleY,
            animationDuration: `${BabidiBombDropConstants.EXPLOSION_MS}ms`,
          }}
        />
      )}
    </>
  );
}
