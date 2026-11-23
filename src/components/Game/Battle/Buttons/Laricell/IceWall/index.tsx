import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";
import { getActiveAbility } from "@/data/characters/abilities";
import { playerPathLaricellHabilities } from "@/utils/paths/index";

type Props = {
  disabled?: boolean;
  onClick: () => void;
  ready: boolean;
  remaining: number;
};

export function IceWallButton({
  ready,
  remaining,
  disabled = false,
  onClick,
}: Props) {
  const ability = getActiveAbility("laricell", "iceWall");
  return (
    <AbilityButton
      type="standard"
      disabled={disabled}
      ready={ready}
      remaining={remaining}
      onClick={onClick}
      image={playerPathLaricellHabilities("iceWall/wall.svg")}
      title={ability ? `${ability.name}: ${ability.description}` : undefined}
    />
  );
}

