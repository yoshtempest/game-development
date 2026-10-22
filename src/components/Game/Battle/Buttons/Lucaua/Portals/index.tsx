import styles from "./styles.module.css";
import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";

type Props = {
  /** Portais já posicionados no mapa. */
  count: number;
  /** Teto de portais simultâneos. */
  maxPortals: number;
  /** Energia consumida por portal (25% da máxima). */
  cost: number;
  disabled?: boolean;
  onClick: () => void;
};

/**
 * Botão dos portais do lucaua ("Energia Dimensional"): um clique abre o seletor
 * de tipo; depois o jogador escolhe no modal, posiciona o fantasma com o
 * joystick e confirma com o ataque. Com o par completo o clique vira o undo do
 * último (devolve a energia) — por isso o rótulo troca.
 */
const portalsClasses: CustomAbilityClasses = {
  button: styles.button,
  label: styles.label,
  count: styles.count,
  full: styles.full,
  cost: styles.cost,
};

export function LucauaPortalsButton({
  count,
  maxPortals,
  cost,
  disabled = false,
  onClick,
}: Props) {
  const full = count >= maxPortals;

  return (
    <AbilityButton
      type="count"
      customClasses={portalsClasses}
      label="PORTAIS"
      full={full}
      fullLabel="DESFAZER"
      count={count}
      maxCount={maxPortals}
      cost={cost}
      costText={full ? `+${cost}` : `-${cost}`}
      disabled={disabled}
      onClick={onClick}
      title={
        full
          ? "Portais: clique para desfazer o último e recuperar a energia"
          : `Portais: clique para escolher o tipo, posicione com o joystick e confirme para fincar (custa ${cost} de energia)`
      }
    />
  );
}
