import { Orbit } from "lucide-react";
import styles from "./styles.module.css";

type Props = {
  /** Portais já posicionados no mapa. */
  count: number;
  /** Teto de portais simultâneos. */
  maxPortals: number;
  /** Energia consumida por portal (25% da máxima). */
  cost: number;
  disabled?: boolean;
  onClick: () => void;
};

/**
 * Botão dos portais do lucaua ("Energia Dimensional"): um clique abre o seletor
 * de tipo; depois o jogador escolhe no modal, posiciona o fantasma com o
 * joystick e confirma com o ataque. Com o par completo o clique vira o undo do
 * último (devolve a energia) — por isso o rótulo troca.
 */
export function LucauaPortalsButton({
  count,
  maxPortals,
  cost,
  disabled = false,
  onClick,
}: Props) {
  const full = count >= maxPortals;

  return (
    <button
      type="button"
      className={`abilityButton ${styles.button} ${full ? styles.full : ""} ${
        disabled ? "abilityDisabled" : ""
      }`}
      disabled={disabled}
      title={
        full
          ? "Portais: clique para desfazer o último e recuperar a energia"
          : `Portais: clique para escolher o tipo, posicione com o joystick e confirme para fincar (custa ${cost} de energia)`
      }
      onClick={onClick}
    >
      <span className={styles.count}>
        {count}/{maxPortals}
      </span>
      <span className={`abilityLabel ${styles.label}`}>
        <Orbit size={14} />
        {full ? "DESFAZER" : "PORTAIS"}
      </span>
      <span className={styles.cost}>{full ? `+${cost}` : `-${cost}`}</span>
    </button>
  );
}
