import { Ghost } from "lucide-react";
import { EMANUEL_CLONE_MAX_COST } from "@/data/characters/emanuel/emanuel";
import styles from "./styles.module.css";

type Props = {
  energy: number;
  disabled?: boolean;
  onPress: () => void;
  onRelease: () => void;
};

const CLONE_MIN_KI = 1;

/**
 * Botão de hold da instância do Emanuel: segurar cria a cópia de silhueta e
 * soltar teleporta para a posição dela (consome até 50 de Ki pela distância).
 * Usa pointer capture para garantir o release mesmo soltando fora do botão.
 */
export function EmanuelCloneButton({
  energy,
  disabled = false,
  onPress,
  onRelease,
}: Props) {
  const noKi = energy < CLONE_MIN_KI;

  return (
    <button
      className={`abilityButton ${styles.button} ${noKi ? styles.depleted : ""} ${
        disabled ? "abilityDisabled" : ""
      }`}
      disabled={disabled}
      title="Instância: segure para criar a cópia fantasma e mova pela arena; solte para teleportar até ela (custa até 50 de Ki pela distância)"
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
      <span className={styles.value}>{Math.round(energy)}</span>
      <span className={`abilityLabel ${styles.label}`}>
        <Ghost size={14} />
        INSTÂNCIA
      </span>
      <span className={styles.cost}>-{EMANUEL_CLONE_MAX_COST} Ki</span>
    </button>
  );
}
