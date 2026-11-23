import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";
import { playerPathLaricellHabilities } from "@/utils/paths/index";

type Props = {
  disabled?: boolean;
  onClick: () => void;
  ready: boolean;
  remaining: number;
};

export function VampireFormButton({
  ready,
  remaining,
  disabled = false,
  onClick,
}: Props) {
  return (
    <AbilityButton
      type="standard"
      disabled={disabled}
      ready={ready}
      remaining={remaining}
      onClick={onClick}
      image={playerPathLaricellHabilities("vampireForm/aura.svg")}
      title="Entra no modo vampira"
    />
  );
}

