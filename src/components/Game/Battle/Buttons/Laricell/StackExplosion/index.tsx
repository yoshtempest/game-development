import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";
import { getActiveAbility } from "@/data/characters/abilities";
import { npcPathProjectile } from "@/utils/paths";

type Props = {
  disabled?: boolean;
  onClick: () => void;
  ready: boolean;
  remaining: number;
};

export function StackExplosionButton({
  ready,
  remaining,
  disabled = false,
  onClick,
}: Props) {
  const ability = getActiveAbility("laricell", "stackExplosion");
  return (
    <AbilityButton
      type="standard"
      disabled={disabled}
      ready={ready}
      remaining={remaining}
      onClick={onClick}
      image={npcPathProjectile("explosion.svg")}
      title={ability ? `${ability.name}: ${ability.description}` : undefined}
    />
  );
}

