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
  onPress: () => void;
  onRelease: () => void;
};

/**
 * Botão de hold dos portais do lucaua ("Energia Dimensional"): segurar abre o
 * seletor de tipo, o joystick posiciona o fantasma e soltar finca o portal.
 * Com o par completo o toque vira o undo do último (devolve a energia) — por
 * isso o rótulo troca. Usa pointer capture para garantir o release mesmo
 * soltando fora do botão.
 */
export function LucauaPortalsButton({
  count,
  maxPortals,
  cost,
  disabled = false,
  onPress,
  onRelease,
}: Props) {
  const full = count >= maxPortals;

  return (
    <button
      className={`abilityButton ${styles.button} ${full ? styles.full : ""} ${
        disabled ? "abilityDisabled" : ""
      }`}
      disabled={disabled}
      title={
        full
          ? "Portais: toque para desfazer o último e recuperar a energia"
          : `Portais: segure para escolher o tipo e posicione com o joystick; solte para fincar (custa ${cost} de energia)`
      }
      style={{ touchAction: "none" }}
      onPointerDown={(e) => {
        if (disabled) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        onPress();
      }}
      onPointerUp={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
        onRelease();
      }}
      onPointerCancel={() => onRelease()}
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
