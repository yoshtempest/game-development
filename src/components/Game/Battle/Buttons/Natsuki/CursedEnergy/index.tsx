import React from "react";
import { cursedEnergyHealAmount } from "@/gameRules/battle/cursedEnergy";

import styles from "./styles.module.css";
import { AbilityButton, type CustomAbilityClasses } from "@/components/Game/Battle/Buttons/AbilityButton";

type Props = {
  energy: number;
  energyMax: number;
  disabled?: boolean;
  onClick: () => void;
};

/**
 * Botão de conversão de energia amaldiçoada em HP (Riquelme).
 * Mostra barra de energia, valor atual e cura disponível.
 */
const cursedEnergyClasses: CustomAbilityClasses = {
  button: styles.button,
  value: styles.value,
  energyBar: styles.energyBar,
  heal: styles.heal,
};

export function CursedEnergyButton({
  energy,
  energyMax,
  disabled = false,
  onClick,
}: Props) {
  const heal = cursedEnergyHealAmount(energy);
  const pct = energyMax > 0 ? Math.round((energy / energyMax) * 100) : 0;

  const beforeLabel = (
    <React.Fragment>
      <span className={styles.energyBar} style={{ width: `${pct}%` }} />
      <span className={styles.value}>{Math.round(energy)}</span>
      {heal > 0 && <span className={styles.heal}>+{heal} HP</span>}
    </React.Fragment>
  );

  return (
    <AbilityButton
      type="custom"
      customClasses={cursedEnergyClasses}
      label=""
      disabled={disabled}
      onClick={onClick}
      title="Converte energia amaldiçoada em vida (5 energia = 1 HP)"
      renderExtra={{ beforeLabel }}
    />
  );
}
