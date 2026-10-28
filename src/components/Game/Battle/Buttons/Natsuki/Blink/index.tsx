import { BLINK_ENERGY_COST } from "@/gameRules/battle/cursedEnergy";

import styles from "./styles.module.css";
import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";

type Props = {
  energy: number;
  disabled?: boolean;
  onClick: () => void;
};

/**
 * Botão do Blink (teleporte curto do Natsuki).
 * type="hold" para usar valueText/costText.
 */
const blinkClasses: CustomAbilityClasses = {
  button: styles.button,
  label: styles.label,
  value: styles.value,
  cost: styles.cost,
};

export function BlinkButton({ energy, disabled = false, onClick }: Props) {
  return (
    <AbilityButton
      type="hold"
      customClasses={blinkClasses}
      label="BLINK"
      disabled={disabled}
      onPress={onClick}
      onRelease={() => {}}
      full={false}
      valueText={Math.round(energy).toString()}
      costText={`-{BLINK_ENERGY_COST}`}
      title={`Blink: teleporte curto à frente (custa ${BLINK_ENERGY_COST} de energia amaldiçoada)`}
    />
  );
}
