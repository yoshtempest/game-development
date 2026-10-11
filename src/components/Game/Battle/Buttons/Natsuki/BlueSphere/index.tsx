import { Sparkles } from "lucide-react";
import styles from "./styles.module.css";

type Props = {
  disabled?: boolean;
  active?: boolean;
  onClick: () => void;
};

export function BlueSphereButton({
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
      aria-label="Invocar/Controlar Esfera Azul"
      title={
        active
          ? "Esfera azul controlada (segure/dirija). Aperte para parar a atração."
          : "Invocar Esfera Azul (atrai inimigos, causa dano mágico contínuo)."
      }
    >
      <Sparkles className="abilityLabelIcon" size={14} aria-hidden="true" />
      <span className={styles.label}>Azul</span>
    </button>
  );
}
