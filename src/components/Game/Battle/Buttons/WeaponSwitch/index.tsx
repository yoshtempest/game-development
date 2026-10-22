import { LUCAS_WEAPON_LABELS } from "@/data/characters/lucas/lucasWeapons";
import { playerPath } from "@/utils/paths";

import styles from "./styles.module.css";
import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";

type Props = {
  weapon?: LucasWeapon;
  disabled?: boolean;
  onClick: () => void;
};

/**
 * Botão de troca de arma do Lucas: alterna entre arma primária e secundária.
 * Usa type="custom" porque tem layout próprio (imagem de fundo + nome da arma).
 */
const weaponSwitchClasses: CustomAbilityClasses = {
  button: styles.button,
  weaponName: styles.weaponName,
};

export function WeaponSwitchButton({
  weapon,
  disabled = false,
  onClick,
}: Props) {
  if (!weapon) return null;

  const label = LUCAS_WEAPON_LABELS[weapon];
  const imageUrl = playerPath(`/lucas/${weapon}.svg`);

  return (
    <AbilityButton
      type="custom"
      customClasses={weaponSwitchClasses}
      label={label}
      disabled={disabled}
      onClick={onClick}
      title={label}
      style={{
        backgroundImage: `url("${imageUrl}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      renderExtra={{
        afterLabel: <span className={styles.weaponName}>{label}</span>,
      }}
    />
  );
}
