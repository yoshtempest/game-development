import { spriteMap } from "@/data/battle/projectileSprites";

import styles from "./styles.module.css";
import { AbilityButton, type CustomAbilityClasses } from "@/components/Game/Battle/Buttons/AbilityButton";

type Props = {
  disabled?: boolean;
  active?: boolean;
  onClick: () => void;
};

/**
 * Botão da Esfera Roxa (fusão das esferas azul e vermelha).
 * type="custom" pois tem imagem de fundo + estado ativo.
 */
const purpleSphereClasses: CustomAbilityClasses = {
  button: styles.button,
  label: styles.label,
  active: styles.active,
};

export function PurpleSphereButton({
  disabled = false,
  active = false,
  onClick,
}: Props) {
  return (
    <AbilityButton
      type="custom"
      customClasses={purpleSphereClasses}
      label="Roxa"
      disabled={disabled}
      onClick={onClick}
      extraProps={{ active }}
      title="Esfera Roxa: atravessa todos os inimigos no caminho (2x o dano da vermelha), destrói projéteis e é indestrutível."
      style={{
        backgroundImage: `url("${spriteMap.purpleSphere}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
}
