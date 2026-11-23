import type { CSSProperties } from "react";

import { ProjectileConstants } from "@/data/projectile";
import {
  REWIND_RESURRECTION_ABILITY_FOLDER,
  REWIND_RESURRECTION_FILES,
  REWIND_RESURRECTION_LAUNCH_HEIGHT,
  REWIND_RESURRECTION_PHASE_MS,
  REWIND_RESURRECTION_PLAYER_SPRITE,
} from "@/data/characters/srGuaxinim/resurrection";

import {
  npcPathProjectile,
  playerAbilityPath,
  playerPath,
} from "@/utils/paths";
import { getViewportSize } from "@/utils/viewport";
import type { RewindResurrection } from "@/utils/types/battle/rewind";

import styles from "./styles.module.css";

type Props = {
  resurrection: RewindResurrection | null;
  PLAYER_SIZE: number;
};

/**
 * Cinemática da passiva "Retrocesso Temporal" (#284). Só desenha: a sequência
 * de fases e a volta no tempo são do `useRewind`.
 *
 * Portal e fundo galáctico entram como `background-image` empilhado sobre um
 * gradiente: enquanto a arte não existir em `public/`, o gradiente aparece no
 * lugar e a cinemática continua legível, sem `onError` nem estado local.
 * Cada fase remonta pela `key`, então as animações CSS recomeçam do zero.
 */
export function RewindResurrectionAnimation({
  resurrection,
  PLAYER_SIZE,
}: Props) {
  if (!resurrection) return null;

  const { phase, originX, originY, character } = resurrection;
  const { width, height } = getViewportSize();
  const scaleX = width / ProjectileConstants.MAP_WIDTH;
  const scaleY = height / ProjectileConstants.MAP_HEIGHT;

  const left = originX * scaleX;
  const top = originY * scaleY;
  const rise = REWIND_RESURRECTION_LAUNCH_HEIGHT * scaleY;

  const playerSprite = playerPath(
    `/${character}/inFight/${REWIND_RESURRECTION_PLAYER_SPRITE}`,
  );
  const portalSrc = playerAbilityPath(
    character,
    REWIND_RESURRECTION_ABILITY_FOLDER,
    REWIND_RESURRECTION_FILES.portal,
  );
  const galaxySrc = playerAbilityPath(
    character,
    REWIND_RESURRECTION_ABILITY_FOLDER,
    REWIND_RESURRECTION_FILES.galaxy,
  );

  const vars = {
    "--rr-duration": `${REWIND_RESURRECTION_PHASE_MS[phase]}ms`,
    "--rr-rise": `${rise}px`,
    "--rr-size": `${PLAYER_SIZE}px`,
  } as CSSProperties;

  if (phase === "launch") {
    return (
      <div key={phase} className={styles.layer} style={vars}>
        <img
          src={npcPathProjectile("/explosion.svg")}
          className={styles.explosion}
          style={{ left, top }}
          alt=""
        />
        <img
          src={playerSprite}
          className={styles.launch}
          style={{ left, top }}
          alt=""
        />
      </div>
    );
  }

  if (phase === "portal") {
    return (
      <div key={phase} className={styles.layer} style={vars}>
        <div
          className={styles.portal}
          style={{
            left,
            top: top - rise,
            backgroundImage: `url("${portalSrc}"), radial-gradient(circle, #ffffff 0%, #8f5cff 35%, #2a0b5e 65%, transparent 72%)`,
          }}
        />
        <img
          src={playerSprite}
          className={styles.enterPortal}
          style={{ left, top: top - rise }}
          alt=""
        />
      </div>
    );
  }

  return (
    <div
      key={phase === "flash" ? "void-flash" : phase}
      className={styles.void}
      style={{
        ...vars,
        backgroundImage: `url("${galaxySrc}"), radial-gradient(ellipse at center, #3b1f7a 0%, #120a2e 55%, #03010a 100%)`,
      }}
    >
      <img
        src={playerSprite}
        className={phase === "flash" ? styles.focused : styles.zoom}
        alt=""
      />
      {phase === "flash" && <div className={styles.flash} />}
    </div>
  );
}
