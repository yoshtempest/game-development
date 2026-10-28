import { spriteMap } from "@/data/battle/projectileSprites";
import {
  GENKI_DAMA_BASE_SIZE,
  GENKI_DAMA_CHARGE_EFFECT_ASPECT,
  GENKI_DAMA_CHARGE_EFFECT_SIZE_MULTIPLIER,
  GENKI_DAMA_SPRITE_ASPECT,
} from "@/data/characters/ematron";
import type { GenkiDamaVisual } from "@/utils/types/character/ematron";
import styles from "./styles.module.css";

type Props = {
  visual: GenkiDamaVisual;
  battleScaleX: number;
  battleScaleY: number;
};

/**
 * Esfera da Genki Dama do Ematron: rende o projétil `genkiDama.svg` no formato
 * atual (pairando sobre o jogador enquanto prepara, ou voando até o inimigo).
 * O tamanho base cresce pelo multiplicador de escala (1.2x por segundo).
 */
export function GenkiDama({ visual, battleScaleX, battleScaleY }: Props) {
  const size = GENKI_DAMA_BASE_SIZE * visual.scale;
  const genkiHeight = size * GENKI_DAMA_SPRITE_ASPECT;
  const effectSize = size * GENKI_DAMA_CHARGE_EFFECT_SIZE_MULTIPLIER;

  return (
    <>
      {visual.phase === "preparing" && (
        <img
          src={spriteMap.genkiDamaChargeEffect}
          className={styles.chargeEffect}
          style={{
            left: visual.x * battleScaleX,
            top: visual.y * battleScaleY - 1.5 * genkiHeight,
            width: effectSize,
            height: effectSize * GENKI_DAMA_CHARGE_EFFECT_ASPECT,
            zIndex: 22,
          }}
        />
      )}
      <img
        src={spriteMap.genkiDama}
        className={styles.genkiDama}
        style={{
          position: "absolute",
          left: visual.x * battleScaleX,
          top: visual.y * battleScaleY,
          width: size,
          transform: "translate(-50%, -200%)",
          zIndex: 18,
          pointerEvents: "none",
        }}
      />
    </>
  );
}
