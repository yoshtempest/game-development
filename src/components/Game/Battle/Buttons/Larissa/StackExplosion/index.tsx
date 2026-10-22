import { STACK_EXPLOSION_COOLDOWN_MS } from "@/data/characters/larissa/larissa";

import styles from "./styles.module.css";
import { AbilityButton, type CustomAbilityClasses } from "@/components/Game/Battle/Buttons/AbilityButton";

type Props = {
  ready: boolean;
  remaining: number;
  disabled?: boolean;
  onClick: () => void;
};

/**
 * Botão da "Explosão de Stacks" (Larissa): consome os stacks acumulados pelos
 * ataques básicos numa explosão (5 de dano por stack). Era o special da
 * Larissa; virou habilidade própria, com o mesmo cooldown de 20s.
 */
const stackExplosionClasses: CustomAbilityClasses = {
  button: styles.button,
  label: styles.label,
  ready: styles.ready,
  cooldown: styles.cooldown,
};

export function StackExplosionButton({
  ready,
  remaining,
  disabled = false,
  onClick,
}: Props) {
  return (
    <AbilityButton
      type="standard"
      customClasses={stackExplosionClasses}
      label="EXPLOSÃO"
      ready={ready}
      remaining={remaining}
      disabled={disabled}
      onClick={onClick}
      title={`Explosão de Stacks: consome os stacks acumulados numa explosão. Cooldown de ${STACK_EXPLOSION_COOLDOWN_MS / 1000}s.`}
    />
  );
}
