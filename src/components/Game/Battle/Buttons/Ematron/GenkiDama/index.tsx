import {
  GENKI_DAMA_INITIAL_COST,
  GENKI_DAMA_MAX_DAMAGE_MULTIPLIER,
} from "@/data/characters/emanuel/emanuel";

import { spriteMap } from "@/data/battle/projectileSprites";
import styles from "./styles.module.css";
import { AbilityButton, type CustomAbilityClasses } from "@/components/Game/Battle/Buttons/AbilityButton";

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
const genkiDamaClasses: CustomAbilityClasses = {
  button: styles.button,
  label: styles.label,
  value: styles.value,
  cost: styles.cost,
  depleted: styles.depleted,
};

export function EmanuelGenkiDamaButton({
  energy,
  disabled = false,
  onPress,
  onRelease,
}: Props) {
  const noKi = energy < GENKI_DAMA_INITIAL_COST;

  return (
    <AbilityButton
      type="hold"
      customClasses={genkiDamaClasses}
      label="GENKI DAMA"
      disabled={disabled}
      onPress={onPress}
      onRelease={onRelease}
      full={noKi}
      valueText={Math.round(energy).toString()}
      costText={`-{GENKI_DAMA_INITIAL_COST} Ki`}
      extraProps={{ depleted: noKi }}
      title={`Genki Dama: segure para flutuar e reunir energia na esfera (cresce a cada segundo; solte para arremessar). Custa ${GENKI_DAMA_INITIAL_COST} de Ki + dreno contínuo enquanto segura. Dano máximo: ${GENKI_DAMA_MAX_DAMAGE_MULTIPLIER}x o ataque básico`}
      style={{
        backgroundImage: `url("${spriteMap.genkiDama}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
}
