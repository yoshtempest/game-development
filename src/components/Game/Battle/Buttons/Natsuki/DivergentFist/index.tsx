import { DIVERGENT_FIST_COST } from "@/gameRules/battle/cursedEnergy";

import styles from "./styles.module.css";
import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";

type Props = {
  energy: number;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

/**
 * Botão do Punho Divergente (Natsuki).
 * type="custom" para suportar estado active.
 */
const divergentFistClasses: CustomAbilityClasses = {
  button: styles.button,
  label: styles.label,
  value: styles.value,
  cost: styles.cost,
  active: styles.active,
};

export function DivergentFistButton({
  energy,
  active = false,
  disabled = false,
  onClick,
}: Props) {
  return (
    <AbilityButton
      type="custom"
      customClasses={divergentFistClasses}
      label="punho divergente"
      disabled={disabled}
      onClick={onClick}
      extraProps={{ active }}
      valueText={Math.round(energy).toString()}
      costText={`-{DIVERGENT_FIST_COST}`}
      title={`Punho Divergente: o próximo golpe é um soco com 100% de chance de causar 2 instâncias de dano (custa ${DIVERGENT_FIST_COST} de energia amaldiçoada)`}
    />
  );
}
