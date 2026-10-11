import { Flame } from "lucide-react";

import { STACK_EXPLOSION_COOLDOWN_MS } from "@/data/characters/larissa/larissa";

import styles from "./styles.module.css";

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
export function StackExplosionButton({
  ready,
  remaining,
  disabled = false,
  onClick,
}: Props) {
  const locked = !ready || disabled;

  return (
    <button
      className={`abilityButton ${styles.button} ${ready ? styles.ready : ""} ${
        disabled ? "abilityDisabled" : ""
      }`}
      onClick={onClick}
      disabled={locked}
      title={`Explosão de Stacks: consome os stacks acumulados numa explosão. Cooldown de ${STACK_EXPLOSION_COOLDOWN_MS / 1000}s.`}
    >
      <span className={`abilityLabel ${styles.label}`}>
        <Flame size={13} />
        EXPLOSÃO
      </span>
      {!ready && remaining > 0 && (
        <span className={styles.cooldown}>{remaining.toFixed(1)}s</span>
      )}
    </button>
  );
}
