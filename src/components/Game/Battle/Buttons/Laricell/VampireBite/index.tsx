import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";
import { getActiveAbility } from "@/data/characters/abilities";

import styles from "@/components/Game/Battle/Buttons/Laricell/styles.module.css";

type Props = {
  disabled?: boolean;
  onClick: () => void;
  ready: boolean;
  remaining: number;
};

/**
 * Mordida: única habilidade visível enquanto a Forma Vampira dura (issue #517).
 * Não há arte de fundo própria, então o rótulo curto identifica o botão; o nome
 * completo, o efeito e o cooldown vêm do registro em `abilityFactories`.
 */
export function VampireBiteButton({
  ready,
  remaining,
  disabled = false,
  onClick,
}: Props) {
  const ability = getActiveAbility("laricell", "vampireBite");
  return (
    <AbilityButton
      type="standard"
      disabled={disabled}
      ready={ready}
      remaining={remaining}
      onClick={onClick}
      renderExtra={{
        beforeLabel: <span className={styles.shortLabel}>MORDIDA</span>,
      }}
      title={ability ? `${ability.name}: ${ability.description}` : undefined}
    />
  );
}
