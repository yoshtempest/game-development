import { YVEL_WEAPON_LABELS } from "@/data/characters/yvel/yvelWeapons";
import { playerPath } from "@/utils/paths";

import styles from "./styles.module.css";
import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";

type Props = {
  weapon?: YvelWeapon;
  disabled?: boolean;
  onClick: () => void;
};

/**
 * Botão de troca de arma do Yvel: alterna entre arma primária e secundária.
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

  const label = YVEL_WEAPON_LABELS[weapon];
  const imageUrl = playerPath(`/yvel/${weapon}.svg`);

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
