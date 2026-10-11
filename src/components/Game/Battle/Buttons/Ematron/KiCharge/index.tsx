import { Zap } from "lucide-react";
import {
  EMANUEL_KI_CHARGE_PER_TICK,
  EMANUEL_KI_CHARGE_TICK_MS,
} from "@/data/characters/emanuel/emanuel";
import styles from "./styles.module.css";

type Props = {
  energy: number;
  energyMax: number;
  disabled?: boolean;
  onPress: () => void;
  onRelease: () => void;
};

/**
 * Botão de hold da carga de Ki do Emanuel: segurar deixa o personagem parado
 * no sprite `chargingKi.svg` recarregando +1 de Ki a cada 100ms (sem poder
 * agir); soltar volta ao normal. Usa pointer capture para garantir o release
 * mesmo soltando fora do botão.
 */
export function EmanuelKiChargeButton({
  energy,
  energyMax,
  disabled = false,
  onPress,
  onRelease,
}: Props) {
  const full = energy >= energyMax;

  return (
    <button
      className={`abilityButton ${styles.button} ${full ? styles.full : ""} ${
        disabled ? "abilityDisabled" : ""
      }`}
      disabled={disabled}
      title={`Carga de Ki: segure para recarregar +${EMANUEL_KI_CHARGE_PER_TICK} de Ki a cada ${EMANUEL_KI_CHARGE_TICK_MS}ms (o personagem fica parado sem poder agir)`}
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
        <Zap size={14} />
        CARGA DE KI
      </span>
      <span className={styles.cost}>+{EMANUEL_KI_CHARGE_PER_TICK}/100ms</span>
    </button>
  );
}
