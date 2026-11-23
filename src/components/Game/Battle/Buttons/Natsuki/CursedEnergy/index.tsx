// import React from "react";
// import { cursedEnergyHealAmount } from "@/gameRules/battle/cursedEnergy";

import styles from "./styles.module.css";
import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";
import { playerPathNatsukiHabilities } from "@/utils/paths";

type Props = {
  energy: number;
  energyMax: number;
  disabled?: boolean;
  onClick: () => void;
};

/**
 * Botão de conversão de energia amaldiçoada em HP (Natsuki).
 * Mostra barra de energia, valor atual e cura disponível.
 */
const cursedEnergyClasses: CustomAbilityClasses = {
  button: styles.button,
};

export function CursedEnergyButton({
  disabled = false,
  onClick,
}: Props) {
  return (
    <AbilityButton
      type="custom"
      customClasses={cursedEnergyClasses}
      disabled={disabled}
      onClick={onClick}
      title="Converte energia amaldiçoada em vida (5 energia = 1 HP)"
      // renderExtra={{ beforeLabel }}
      image={playerPathNatsukiHabilities("heal/healEffect.svg")}
    />
  );
}
