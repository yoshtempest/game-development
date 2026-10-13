import { Sparkles } from "lucide-react";
import styles from "./styles.module.css";

type Props = {
  disabled?: boolean;
  active?: boolean;
  onClick: () => void;
};

export function PurpleSphereButton({
  disabled = false,
  active = false,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      className={`abilityButton ${styles.button} ${
        active ? styles.active : ""
      } ${disabled ? "abilityDisabled" : ""}`}
      disabled={disabled}
      onClick={onClick}
      aria-label="Esfera Roxa (fusão das esferas azul e vermelha)"
      title="Esfera Roxa: atravessa todos os inimigos no caminho (2x o dano da vermelha), destrói projéteis e é indestrutível."
    >
      <Sparkles className="abilityLabelIcon" size={14} aria-hidden="true" />
      <span className={styles.label}>Roxa</span>
    </button>
  );
}
