import { effectsPath } from "@/utils/paths";
import { ProjectileConstants } from "@/data/projectile";
import { getViewportSize } from "@/utils/viewport";
import styles from "./styles.module.css";

const DIVERGENT_FIST_SPRITE_NAMES = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
] as const;

const SPRITE_ASPECT = 183 / 482;

type Props = {
  frame: number | null;
  npcX: number;
  npcY: number;
  npcHeight: number;
};

/**
 * Sobreposição do Punho Divergente do natsuki: exibe `one.svg` → `eight.svg`
 * sobre o inimigo, cada sprite com `DIVERGENT_FIST_FRAME_MS` de duração. O
 * inimigo é empurrado e recebe a segunda instância de dano no sprite `four`.
 * Os sprites vivem em `assets/effects/divergent/` (compartilhados — podem ser
 * usados por outros NPCs/efeitos sem depender da pasta do natsuki).
 */
export function DivergentFistAnimation({
  frame,
  npcX,
  npcY,
  npcHeight,
}: Props) {
  if (frame == null) return null;

  const spriteName =
    DIVERGENT_FIST_SPRITE_NAMES[
      Math.min(frame, DIVERGENT_FIST_SPRITE_NAMES.length - 1)
    ];

  const scaleX = getViewportSize().width / ProjectileConstants.MAP_WIDTH;
  const scaleY = getViewportSize().height / ProjectileConstants.MAP_HEIGHT;

  const imgHeight = npcHeight * 2;
  const imgWidth = imgHeight * SPRITE_ASPECT;

  const src = effectsPath(`/divergent/${spriteName}.svg`);

  return (
    <img
      src={src}
      className={styles.overlay}
      style={{
        width: imgWidth,
        height: imgHeight,
        left: npcX * scaleX,
        top: npcY * scaleY - npcHeight * 0.8,
        transform: "translate(-50%, -50%)",
      }}
    />
  );
}
