import { Bomb } from "lucide-react";

import { KILLER_QUEEN_COOLDOWN_MS, TOTAL_FREEZE_MS } from "@/data/characters/srGuaxinim";

import styles from "./styles.module.css";

type Props = {
  ready: boolean;
  remaining: number;
  disabled?: boolean;
  onClick: () => void;
};

/**
 * Botão da "Killer Queen" (Artur): congela o tempo, marca cada inimigo e
 * projétil destrutível com uma bomba e detona todos em área. Era o special do
 * Artur; virou habilidade própria, com o mesmo cooldown de 20s.
 */
export function KillerQueenButton({
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
      title={`Killer Queen: congela o tempo por ${TOTAL_FREEZE_MS / 1000}s e explode todos os alvos marcados. Cooldown de ${KILLER_QUEEN_COOLDOWN_MS / 1000}s.`}
    >
      <span className={`abilityLabel ${styles.label}`}>
        <Bomb size={13} />
        KILLER QUEEN
      </span>
      {!ready && remaining > 0 && (
        <span className={styles.cooldown}>{remaining.toFixed(1)}s</span>
      )}
    </button>
  );
}
