import { getViewportSize } from "@/utils/viewport";
import { ProjectileConstants } from "@/data/projectile";
import {
  getBossSizeMultiplier,
  getNpcSpriteYOffset,
} from "@/utils/npc/getSpritePath";
import { playerPathMarshadowHabilities } from "@/utils/paths";
import { MARSHADOW_CUT_IN_ENEMIE_SRC } from "@/data/characters/marshadow/marshadowCutIn";
import type { AtomicCut, AtomicExplosion } from "@/utils/types/battle/atomic";
import styles from "./styles.module.css";

type Props = {
  /** Explosão centrada no inimigo com maior vida máxima (alvo). */
  explosion: AtomicExplosion | null;
  /** CutInEnemie sobre cada inimigo atingido dentro do raio. */
  cuts: AtomicCut[];
  TILE_SIZE: number;
  /** npcType do inimigo principal (para o tamanho do alvo usar o multiplicador de boss). */
  mainNpcType?: string;
  /** Multiplicador de tamanho do boss principal (fase + alfa). */
  bossSizeMultiplier?: number;
};

function explosionSrc(phase: AtomicExplosion["phase"]): string {
  const file = phase === "starting" ? "startingExplosion" : "explosion";
  return playerPathMarshadowHabilities(`/atomic/${file}.svg`);
}

/**
 * Efeitos visuais da habilidade "I Am Atomic" do marshadow: a startingExplosion/
 * explosion.svg centrada no alvo (inimigo de maior vida máxima) e um
 * CutInEnemie sobre cada inimigo atingido dentro do raio. Cada overlay é
 * ancorado no mesmo container do adversário (pés + offset de sprite).
 */
export function AtomicEffects({
  explosion,
  cuts,
  TILE_SIZE,
  mainNpcType,
  bossSizeMultiplier,
}: Props) {
  const scaleX = getViewportSize().width / ProjectileConstants.MAP_WIDTH;
  const scaleY = getViewportSize().height / ProjectileConstants.MAP_HEIGHT;

  return (
    <>
      {explosion && (
        <div
          className={styles.anchor}
          style={{
            left: explosion.x * scaleX,
            top: explosion.y * scaleY,
            width:
              TILE_SIZE *
              (explosion.npcType === mainNpcType && bossSizeMultiplier != null
                ? bossSizeMultiplier
                : getBossSizeMultiplier(explosion.npcType)),
            height:
              TILE_SIZE *
              (explosion.npcType === mainNpcType && bossSizeMultiplier != null
                ? bossSizeMultiplier
                : getBossSizeMultiplier(explosion.npcType)),
            transform: `translate(-50%, calc(-100% + ${
              getNpcSpriteYOffset(explosion.npcType) * 100
            }%))`,
          }}
        >
          <img
            src={explosionSrc(explosion.phase)}
            alt=""
            className={styles.explosion}
            style={{
              width:
                TILE_SIZE *
                (explosion.npcType === mainNpcType && bossSizeMultiplier != null
                  ? bossSizeMultiplier
                  : getBossSizeMultiplier(explosion.npcType)) *
                2,
            }}
          />
        </div>
      )}

      {cuts.map((cut) => {
        const size = getBossSizeMultiplier(cut.npcType);
        return (
          <div
            key={cut.key}
            className={styles.anchor}
            style={{
              left: cut.x * scaleX,
              top: cut.y * scaleY,
              width: TILE_SIZE * size,
              height: TILE_SIZE * size,
              transform: `translate(-50%, calc(-100% + ${
                getNpcSpriteYOffset(cut.npcType) * 100
              }%))`,
            }}
          >
            <img
              src={MARSHADOW_CUT_IN_ENEMIE_SRC}
              alt=""
              className={styles.cut}
              style={{
                width: TILE_SIZE * size * 0.5,
                top: TILE_SIZE * 0.35,
                transform: `translate(-50%, -50%) rotate(${cut.rotation}deg)`,
              }}
            />
          </div>
        );
      })}
    </>
  );
}
