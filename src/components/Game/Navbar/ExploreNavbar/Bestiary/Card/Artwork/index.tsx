
import styles from "./styles.module.css";

import { npcPath } from "@/utils/paths";

import type { Props } from "../types";

type ArtworkProps = Pick<
  Props,
  | "npcType"
  | "baseNpcType"
  | "name"
  | "encountered"
  | "isAlfa"
  | "variant"
  | "index"
>;

export function BestiaryArtwork({
  npcType,
  baseNpcType,
  name,
  encountered,
  isAlfa,
  variant,
  index = 0,
}: ArtworkProps) {
  const spritePath = isAlfa
    ? `/${baseNpcType}/alfa`
    : `/${npcType}`;

  const spriteSrc = (sprite: string) =>
    npcPath(`${spritePath}/${sprite}.svg`);

  const isDetail = variant === "detail";

  return (
    <div
      className={isDetail ? styles.detailArt : styles.spriteBox}
    >
      <img
        loading="lazy"
        decoding="async"
        src={spriteSrc("default")}
        alt={name}
        className={`${isDetail ? styles.detailSprite : styles.sprite} ${
          encountered ? "" : styles.silhouette
        }`}
        onError={(e) => {
          const img = e.currentTarget;

          if (img.dataset.fallback === "default") {
            img.dataset.fallback = "walk";
            img.src = spriteSrc("walk");
          } else if (img.dataset.fallback === "walk") {
            img.dataset.fallback = "right";
            img.src = spriteSrc("right");
          }
        }}
        data-fallback="default"
      />

      {isDetail && (
        <span className={styles.detailIndex}>
          #{String(index + 1).padStart(2, "0")}
        </span>
      )}
    </div>
  );
}
