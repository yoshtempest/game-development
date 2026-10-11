import { Flame } from "lucide-react";
import styles from "./styles.module.css";

type Props = {
  disabled?: boolean;
  onClick: () => void;
};

export function RedSphereButton({ disabled = false, onClick }: Props) {
  return (
    <button
      type="button"
      className={`abilityButton ${styles.button} ${
        disabled ? "abilityDisabled" : ""
      }`}
      disabled={disabled}
      onClick={onClick}
      aria-label="Arremessar Esfera Vermelha"
      title="Invoca e arremessa a esfera vermelha (dano mágico + empurrão)."
    >
      <Flame className="abilityLabelIcon" size={14} aria-hidden="true" />
      <span className={styles.label}>Vermelha</span>
    </button>
  );
}
