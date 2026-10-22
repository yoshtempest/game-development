import {
  EMANUEL_KI_CHARGE_PER_TICK,
  EMANUEL_KI_CHARGE_TICK_MS,
} from "@/data/characters/emanuel/emanuel";

import styles from "./styles.module.css";
import { AbilityButton, type CustomAbilityClasses } from "@/components/Game/Battle/Buttons/AbilityButton";

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
const kiChargeClasses: CustomAbilityClasses = {
  button: styles.button,
  label: styles.label,
  full: styles.full,
  value: styles.value,
  cost: styles.cost,
};

export function EmanuelKiChargeButton({
  energy,
  energyMax,
  disabled = false,
  onPress,
  onRelease,
}: Props) {
  const full = energy >= energyMax;

  return (
    <AbilityButton
      type="hold"
      customClasses={kiChargeClasses}
      label="CARGA DE KI"
      disabled={disabled}
      onPress={onPress}
      onRelease={onRelease}
      full={full}
      valueText={Math.round(energy).toString()}
      costText={`+${EMANUEL_KI_CHARGE_PER_TICK}/100ms`}
      title={`Carga de Ki: segure para recarregar +${EMANUEL_KI_CHARGE_PER_TICK} de Ki a cada ${EMANUEL_KI_CHARGE_TICK_MS}ms (o personagem fica parado sem poder agir)`}
    />
  );
}
