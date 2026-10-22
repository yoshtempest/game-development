import { playerProjectilePath } from "@/utils/paths";

import styles from "./styles.module.css";
import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";

type Props = {
  disabled?: boolean;
  onClick: () => void;
  /** Stacks de Laser disponíveis na Forma Vastolord (exibidos quando > 1). */
  charges?: number;
};

/**
 * Botão do Laser da Forma Vastolord do marcelo: dispara um feixe que cruza o
 * mapa por 3s, causando 1% do dano base a cada 20ms e empurrando o inimigo.
 * Só é renderizado durante a forma; cada inimigo derrotado (incluindo minions)
 * concede +1 stack de Laser.
 */
const laserClasses: CustomAbilityClasses = {
  button: styles.button,
  label: styles.label,
  charges: styles.charges,
};

export function VastolordLaserButton({
  disabled = false,
  onClick,
  charges = 0,
}: Props) {
  const imageUrl = playerProjectilePath("vastolordLaser.svg");

  return (
    <AbilityButton
      type="custom"
      customClasses={laserClasses}
      label="VASTOLORD LASER"
      disabled={disabled}
      onClick={onClick}
      extraProps={{ charges }}
      title="Laser Vastolord: feixe que cruza o mapa por 3s causando 1% do dano base a cada 20ms de contato e empurrando o inimigo. Cada inimigo derrotado na forma concede +1 stack de laser."
      style={{
        backgroundImage: `url("${imageUrl}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
}
