import { spriteMap } from "@/data/battle/projectileSprites";

import styles from "./styles.module.css";
import { AbilityButton, type CustomAbilityClasses } from "@/components/Game/Battle/Buttons/AbilityButton";

type Props = {
  disabled?: boolean;
  active?: boolean;
  onClick: () => void;
};

/**
 * Botão da Esfera Azul (invocar/controlar).
 * type="custom" pois tem imagem de fundo + estado ativo.
 */
const blueSphereClasses: CustomAbilityClasses = {
  button: styles.button,
  label: styles.label,
  active: styles.active,
};

export function BlueSphereButton({
  disabled = false,
  active = false,
  onClick,
}: Props) {
  return (
    <AbilityButton
      type="custom"
      customClasses={blueSphereClasses}
      label="Azul"
      disabled={disabled}
      onClick={onClick}
      extraProps={{ active }}
      title={
        active
          ? "Esfera azul controlada (segure/dirija). Aperte para parar a atração."
          : "Invocar Esfera Azul (atrai inimigos, causa dano mágico contínuo)."
      }
      style={{
        backgroundImage: `url("${spriteMap.blueSphere}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
}
