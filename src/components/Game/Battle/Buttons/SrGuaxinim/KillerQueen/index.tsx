import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";
import { npcPathProjectile } from "@/utils/paths";

type Props = {
  ready: boolean;
  remaining: number;
  disabled?: boolean;
  onClick: () => void;
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
      ready={ready}
      remaining={remaining}
      disabled={disabled}
      onClick={onClick}
      image={npcPathProjectile("/explosion.svg")}
    />
  );
}
