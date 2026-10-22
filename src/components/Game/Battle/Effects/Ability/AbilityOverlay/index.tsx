import { useEffect, useState } from "react";
import styles from "./styles.module.css";

type Props = {
  active: boolean;
  /** Imagem de fundo exibida centralizada no overlay. */
  src: string | null;
  /**
   * Variante da animação da imagem: `enter` (fade-in centralizado — special
   * normal e intro do alfa) ou `sweep` (varredura da Expansão de Domínio).
   */
  motion?: "enter" | "sweep";
  /** Pausa da batalha (menu aberto): congela a animação CSS no lugar. */
  paused?: boolean;
};

/**
 * Overlay de abertura de habilidade (special do jogador, habilidade do alfa
 * e intro da Expansão de Domínio). Exibição única: flash, faixas em movimento,
 * streaks e imagem centralizada — ou em varredura, quando é o domínio. Fica
 * acima do fundo da batalha, mas abaixo do jogador/NPCs (renderizado antes
 * do `.SceneMap`). Se a imagem falhar, o único fallback é escondê-la.
 */
export function AbilityOverlay({
  active,
  src,
  motion = "enter",
  paused = false,
}: Props) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  if (!active || !src) return null;

  return (
    <div
      className={`${styles.overlay} ${paused ? styles.paused : ""}`}
      role="presentation"
    >
      <div className={styles.flash} />

      <div className={styles.topMotion}>
        <div className={`${styles.streak} ${styles.streakOne}`} />
        <div className={`${styles.streak} ${styles.streakTwo}`} />
        <div className={`${styles.streak} ${styles.streakThree}`} />
      </div>
      {!imageFailed && (
        <div className={styles.characterContainer}>
          <img
            src={src}
            alt=""
            className={
              motion === "sweep" ? styles.characterSweep : styles.character
            }
            onError={() => setImageFailed(true)}
          />
          {/* <span>{ability.name}</span> */}
        </div>
      )}
      <div className={styles.bottomMotion}>
        <div className={`${styles.streak} ${styles.streakOne}`} />
        <div className={`${styles.streak} ${styles.streakTwo}`} />
        <div className={`${styles.streak} ${styles.streakThree}`} />
      </div>
    </div>
  );
}
