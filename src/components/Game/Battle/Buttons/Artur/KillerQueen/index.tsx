import {
  KILLER_QUEEN_COOLDOWN_MS,
  TOTAL_FREEZE_MS,
} from "@/data/characters/artur/srGuaxinim";

import styles from "./styles.module.css";
import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";

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
const killerQueenClasses: CustomAbilityClasses = {
  button: styles.button,
  label: styles.label,
  ready: styles.ready,
  cooldown: styles.cooldown,
};

export function KillerQueenButton({
  ready,
  remaining,
  disabled = false,
  onClick,
}: Props) {
  return (
    <AbilityButton
      type="standard"
      customClasses={killerQueenClasses}
      label="KILLER QUEEN"
      ready={ready}
      remaining={remaining}
      disabled={disabled}
      onClick={onClick}
      title={`Killer Queen: congela o tempo por ${TOTAL_FREEZE_MS / 1000}s e explode todos os alvos marcados. Cooldown de ${KILLER_QUEEN_COOLDOWN_MS / 1000}s.`}
    />
  );
}
