import { playerAbilityBackgroundPath, lucauaPortalPath } from "@/utils/paths";
import { LUCAUA_PORTAL_KINDS } from "@/data/characters/lucaua/lucaua";
import styles from "./styles.module.css";

import type { LucauaPortalKind } from "@/utils/types/character/lucaua";

type Props = {
  /** Índice do tipo destacado em `LUCAUA_PORTAL_KINDS`. */
  index: number;
  /** Escolhe um tipo pelo card (atalho do ←/→ + confirmar). */
  onPick: (index: number) => void;
};

const PORTAL_LABEL: Record<LucauaPortalKind, string> = {
  ground: "Chão",
  default: "Frontal",
  air: "Aéreo",
};

/**
 * Seletor do tipo de portal do lucaua (o mundo fica congelado enquanto aberto).
 * Um clique no card escolhe o tipo, ou o jogador navega com esquerda/direita e
 * confirma com o ataque; nos dois casos vai para o posicionamento com o
 * joystick.
 */
export function PortalSelect({ index, onPick }: Props) {
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
            Escolha o portal, posicione com o joystick e confirme para fincar
          </p>

          <div className={styles.options}>
            {LUCAUA_PORTAL_KINDS.map((kind, i) => (
              <button
                key={kind}
                type="button"
                className={`${styles.option} ${
                  i === index ? styles.selected : ""
                }`}
                onClick={() => onPick(i)}
              >
                <img
                  className={styles.sprite}
                  src={lucauaPortalPath(kind)}
                  alt=""
                />
                <span className={styles.label}>{PORTAL_LABEL[kind]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
