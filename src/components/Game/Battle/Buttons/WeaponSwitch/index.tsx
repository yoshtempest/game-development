import { LUCAS_WEAPON_LABELS } from "@/data/characters/lucas/lucasWeapons";
import { playerPath } from "@/utils/paths";
import styles from "./styles.module.css";

type Props = {
  weapon?: LucasWeapon;
  disabled?: boolean;
  onClick: () => void;
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
    <button
      className={`abilityButton ${styles.button} ${disabled ? "abilityDisabled" : ""}`}
      style={{
        backgroundImage: `url("${imageUrl}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onClick={onClick}
      disabled={disabled}
      title={label}
    >
      <span className={styles.weaponName}>{label}</span>
    </button>
  );
}
