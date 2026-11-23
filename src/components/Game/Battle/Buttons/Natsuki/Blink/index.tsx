import { BLINK_ENERGY_COST } from "@/gameRules/battle/cursedEnergy";

import styles from "./styles.module.css";
import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";
import { playerPathNatsukiHabilities } from "@/utils/paths/characters/natsuki";

type Props = {
  disabled?: boolean;
  onClick: () => void;
};

/**
 * Botão do Blink (teleporte curto do Natsuki).
 * type="hold" para usar valueText/costText.
 */
const blinkClasses: CustomAbilityClasses = {
  button: styles.button,
};

export function BlinkButton({ disabled = false, onClick }: Props) {
  return (
    <AbilityButton
      type="hold"
      customClasses={blinkClasses}
      // label="BLINK"
      disabled={disabled}
      onPress={onClick}
      onRelease={() => {}}
      full={false}
      // valueText={Math.round(energy).toString()}
      // costText={`-{BLINK_ENERGY_COST}`}
      image={playerPathNatsukiHabilities("blink/blink.svg")}
      title={`Blink: teleporte curto à frente (custa ${BLINK_ENERGY_COST} de energia amaldiçoada)`}
    />
  );
}
