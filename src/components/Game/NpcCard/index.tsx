import { useState } from "react";

import { cardFallbackImage, cardImage } from "@/data/items/cards";

import styles from "./styles.module.css";

type Props = {
  npcType: string;
  alt: string;
  className?: string;
};

/**
 * Arte de uma carta de NPC: o rosto do NPC girando em 3D no eixo vertical.
 *
 * O giro é contínuo (um ciclo a cada 10s) porque a carta é um troféu — o
 * movimento lento a destaca dos outros itens sem roubar atenção (issues #497 e
 * #56). As duas faces mostram a mesma arte para o rosto nunca aparecer
 * espelhado no meio do giro. Se o NPC não tiver `face.svg`, cai na arte antiga
 * da carta; o fallback é guardado por `src` para que reaproveitar o componente
 * com outro NPC tente o rosto de novo. `className` dimensiona o cartão, como
 * faria num `<img>`.
 */
export function NpcCardImage({ npcType, alt, className }: Props) {
  const faceSrc = cardImage(npcType);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = failedSrc === faceSrc ? cardFallbackImage(npcType) : faceSrc;

  function handleError() {
    if (failedSrc !== faceSrc) setFailedSrc(faceSrc);
  }

  return (
    <span
      className={`${styles.scene} ${className ?? ""}`}
      role="img"
      aria-label={alt}
    >
      <span className={styles.card}>
        <img
          className={`${styles.face} ${styles.front}`}
          src={src}
          alt=""
          decoding="async"
          onError={handleError}
        />
        <img
          className={`${styles.face} ${styles.back}`}
          src={src}
          alt=""
          decoding="async"
          aria-hidden="true"
        />
      </span>
    </span>
  );
}
