import { playerAbilityBackgroundPath, lucauaPortalPath } from "@/utils/paths";
import { LUCAUA_PORTAL_KINDS } from "@/data/characters/lucaua/lucaua";
import styles from "./styles.module.css";

import type { LucauaPortalKind } from "@/utils/types/character/lucaua";

type Props = {
  /** Índice do tipo destacado em `LUCAUA_PORTAL_KINDS`. */
  index: number;
};

const PORTAL_LABEL: Record<LucauaPortalKind, string> = {
  ground: "Chão",
  default: "Frontal",
  air: "Aéreo",
};

/**
 * Seletor do tipo de portal do lucaua, aberto enquanto o botão está segurado
 * (o mundo fica congelado). Esquerda/direita destaca um tipo e o input de
 * ataque confirma, indo para o posicionamento com o joystick.
 */
export function PortalSelect({ index }: Props) {
  return (
    <div className="overlay">
      <div className={`modal ${styles.modal}`}>
        <img
          className={styles.background}
          src={playerAbilityBackgroundPath("lucaua", "portals")}
          alt=""
        />

        <div className={styles.content}>
          <h2 className={styles.title}>Energia Dimensional</h2>
          <p className={styles.hint}>
            Escolha o portal e confirme para posicioná-lo
          </p>

          <div className={styles.options}>
            {LUCAUA_PORTAL_KINDS.map((kind, i) => (
              <div
                key={kind}
                className={`${styles.option} ${
                  i === index ? styles.selected : ""
                }`}
              >
                <img
                  className={styles.sprite}
                  src={lucauaPortalPath(kind)}
                  alt=""
                />
                <span className={styles.label}>{PORTAL_LABEL[kind]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
