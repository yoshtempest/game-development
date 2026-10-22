import styles from "./styles.module.css";
import { AbilityButton, type CustomAbilityClasses } from "@/components/Game/Battle/Buttons/AbilityButton";

/**
 * Botão da habilidade "I Am Atomic" do marcelo: dispara a sequência de
 * sprites da habilidade centrada no inimigo com maior vida máxima e causa
 * dano em todos os inimigos num raio de 300px (2x no alvo, 1x nos demais).
 * Cooldown de 20s (mostrado no rótulo quando recarregando).
 */
const atomicClasses: CustomAbilityClasses = {
  button: styles.button,
  label: styles.label,
  ready: styles.ready,
  cooldown: styles.cooldown,
};

export function AtomicButton({
  ready,
  remaining,
  disabled = false,
  onClick,
}: {
  ready: boolean;
  remaining: number;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <AbilityButton
      type="standard"
      customClasses={atomicClasses}
      label="I AM ATOMIC"
      ready={ready}
      remaining={remaining}
      disabled={disabled}
      onClick={onClick}
      title="I Am Atomic: explosão centrada no inimigo com maior vida máxima, causando dano especial em todos os inimigos num raio de 300px (2x no alvo). Cooldown de 20s."
      style={{
        backgroundImage:
          'url("public/assets/player/marcelo/inFight/default/habilities/atomic/background.svg")',
      }}
    />
  );
}
