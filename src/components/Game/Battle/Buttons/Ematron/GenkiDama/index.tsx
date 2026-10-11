import { Orbit } from "lucide-react";
import {
  GENKI_DAMA_INITIAL_COST,
  GENKI_DAMA_MAX_DAMAGE_MULTIPLIER,
} from "@/data/characters/emanuel/emanuel";
import styles from "./styles.module.css";

type Props = {
  energy: number;
  disabled?: boolean;
  onPress: () => void;
  onRelease: () => void;
};

/**
 * Botão de hold da Genki Dama do Emanuel: segurar flutua o personagem e reúne
 * energia na esfera (cresce até 7x o dano básico); soltar arremessa a esfera
 * ao inimigo. Usa pointer capture para garantir o release mesmo soltando fora
 * do botão.
 */
export function EmanuelGenkiDamaButton({
  energy,
  disabled = false,
  onPress,
  onRelease,
}: Props) {
  const noKi = energy < GENKI_DAMA_INITIAL_COST;

  return (
    <button
      className={`abilityButton ${styles.button} ${noKi ? styles.depleted : ""} ${
        disabled ? "abilityDisabled" : ""
      }`}
      disabled={disabled}
      title={`Genki Dama: segure para flutuar e reunir energia na esfera (cresce a cada segundo; solte para arremessar). Custa ${GENKI_DAMA_INITIAL_COST} de Ki + dreno contínuo enquanto segura. Dano máximo: ${GENKI_DAMA_MAX_DAMAGE_MULTIPLIER}x o ataque básico`}
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
        <Orbit size={14} />
        GENKI DAMA
      </span>
      <span className={styles.cost}>-{GENKI_DAMA_INITIAL_COST} Ki</span>
    </button>
  );
}
