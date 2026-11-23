import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";
import { npcPathProjectile } from "@/utils/paths";

type Props = {
  disabled?: boolean;
  onClick: () => void;ready: boolean;
  remaining: number;
};

export function StackExplosionButton({
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
      image={npcPathProjectile("explosion.svg")}
      title="Explode todos os brincos acumulados no inimigo"
    />
  );
}

