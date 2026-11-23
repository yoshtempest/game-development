import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";
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
  return (
    <AbilityButton
      type="standard"
      ready={ready}
      remaining={remaining}
      disabled={disabled}
      onClick={onClick}
      image={playerPathLaricellHabilities("smokeBomb/smoke.svg")}
      title="Arremessa uma bomba de fumaça"
    />
  );
}

