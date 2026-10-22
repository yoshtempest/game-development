import { spriteMap } from "@/data/battle/projectileSprites";

import styles from "./styles.module.css";
import { AbilityButton, type CustomAbilityClasses } from "@/components/Game/Battle/Buttons/AbilityButton";

type Props = {
  disabled?: boolean;
  onClick: () => void;
};

/**
 * Botão da Esfera Vermelha (arremesso).
 * type="custom" pois tem imagem de fundo.
 */
const redSphereClasses: CustomAbilityClasses = {
  button: styles.button,
  label: styles.label,
};

export function RedSphereButton({ disabled = false, onClick }: Props) {
  return (
    <AbilityButton
      type="custom"
      customClasses={redSphereClasses}
      label="Vermelha"
      disabled={disabled}
      onClick={onClick}
      title="Invoca e arremessa a esfera vermelha (dano mágico + empurrão)."
      style={{
        backgroundImage: `url("${spriteMap.redSphere}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
}
