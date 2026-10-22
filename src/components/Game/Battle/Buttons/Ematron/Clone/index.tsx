import styles from "./styles.module.css";
import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";

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
const cloneClasses: CustomAbilityClasses = {
  button: styles.button,
  label: styles.label,
  value: styles.value,
  cost: styles.cost,
  depleted: styles.depleted,
};

export function EmanuelCloneButton({
  energy,
  disabled = false,
  onPress,
  onRelease,
}: Props) {
  const noKi = energy < CLONE_MIN_KI;

  return (
    <AbilityButton
      type="hold"
      customClasses={cloneClasses}
      label="INSTÂNCIA"
      disabled={disabled}
      onPress={onPress}
      onRelease={onRelease}
      full={noKi}
      valueText={Math.round(energy).toString()}
      costText={`-{EMANUEL_CLONE_MAX_COST} Ki`}
      extraProps={{ depleted: noKi }}
      title="Instância: segure para criar a cópia fantasma e mova pela arena; solte para teleportar até ela (custa até 50 de Ki pela distância)"
    />
  );
}
