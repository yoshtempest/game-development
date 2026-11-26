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
 * Brincos Explosivos (A2). Não há arte de fundo própria entre os sprites da
 * Laricell, então o rótulo curto identifica o botão; efeito e cooldown vêm do
 * registro em `abilityFactories`.
 */
export function ExplodingEarringsButton({
  ready,
  remaining,
  disabled = false,
  onClick,
}: Props) {
  const ability = getActiveAbility("laricell", "explodingEarrings");
  return (
    <AbilityButton
      type="standard"
      disabled={disabled}
      ready={ready}
      remaining={remaining}
      onClick={onClick}
      renderExtra={{
        beforeLabel: <span className={styles.shortLabel}>BRINCOS</span>,
      }}
      title={ability ? `${ability.name}: ${ability.description}` : undefined}
    />
  );
}
