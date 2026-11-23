import { useState } from "react";

import { pickStatusOverlay } from "@/data/battle/statusOverlays";
import { statusOverlayPath } from "@/utils/paths";

import type { PlayerStatusApplication } from "@/gameRules/battle/status/statusEffects";

import styles from "./styles.module.css";

type Props = {
  statuses: readonly PlayerStatusApplication[];
};

type OverlayImageProps = {
  src: string;
};

/**
 * Uma imagem de overlay que some sozinha se o arquivo não carregar.
 *
 * As artes dos status chegam aos poucos: até o arquivo existir, o jogo não
 * pode mostrar ícone de imagem quebrada sobre o player. O `key` por `src` no
 * pai remonta o componente quando a imagem muda, zerando o `failed`.
 */
function OverlayImage({ src }: OverlayImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <img
      className={styles.image}
      src={src}
      alt=""
      aria-hidden
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}

/**
 * Imagens de status sobre o sprite do player (issue #42).
 *
 * Uma imagem por status ativo, sorteada por aplicação (`pickStatusOverlay`)
 * e com opacidade parcial definida no CSS module, para o sprite continuar
 * legível por baixo.
 */
export function StatusOverlay({ statuses }: Props) {
  if (statuses.length === 0) return null;

  return (
    <div className={styles.container}>
      {statuses.map(({ status, until }) => {
        const file = pickStatusOverlay(status, until);
        if (!file) return null;
        const src = statusOverlayPath(status, file);
        return <OverlayImage key={`${status}-${src}`} src={src} />;
      })}
    </div>
  );
}
