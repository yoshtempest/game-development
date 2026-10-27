import { playerPathEmanuelHabilities } from "@/utils/paths";

import styles from "./styles.module.css";
import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";

type Props = {
  disabled?: boolean;
  onClick: () => void;
};

/**
 * Botão do Kamehameha do Emanuel: press dispara a carga (2.8s no sprite
 * `chargingKamehameha.svg`) e o efeito (`kamehamehaEffect.svg`, 2s) dispara em
 * direção da face. Enquanto a habilidade está em curso o player não pode agir.
 */
const kamehamehaClasses: CustomAbilityClasses = {
  button: styles.button,
  label: styles.label,
};

export function EmanuelKamehamehaButton({
  disabled = false,
  onClick,
}: Props) {
  const imageUrl = playerPathEmanuelHabilities("/kamehameha/kamehameha.svg");

  return (
    <AbilityButton
      type="custom"
      customClasses={kamehamehaClasses}
      label="KAMEHAMEHA"
      disabled={disabled}
      onClick={onClick}
      style={{
        backgroundImage: `url("${imageUrl}")`,
        backgroundSize: "contain",
        backgroundPosition: "center",
      }}
      title="Kamehameha: carregue por 2.8s no sprite chargingKamehameha e o efeito dispara causando dano contínuo e empurrando o inimigo."
    />
  );
}
