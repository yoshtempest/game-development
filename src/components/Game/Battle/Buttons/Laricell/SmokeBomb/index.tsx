import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";
import { getActiveAbility } from "@/data/characters/abilities";
import { playerPathLaricellHabilities } from "@/utils/paths/index";

type Props = {
  disabled?: boolean;
  onClick: () => void;
  ready: boolean;
  remaining: number;
};

export function SmokeBombButton({
  ready,
  remaining,
  disabled = false,
  onClick,
}: Props) {
  const ability = getActiveAbility("laricell", "smokeBomb");
  return (
    <AbilityButton
      type="standard"
      ready={ready}
      remaining={remaining}
      disabled={disabled}
      onClick={onClick}
      image={playerPathLaricellHabilities("smokeBomb/smoke.svg")}
      title={ability ? `${ability.name}: ${ability.description}` : undefined}
    />
  );
}

