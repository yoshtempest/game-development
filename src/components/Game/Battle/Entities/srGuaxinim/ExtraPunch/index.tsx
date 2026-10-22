import type { ExtraPunchVisual } from "@/utils/types/character/srGuaxinim";
import type { BattleEntityPositioning } from "@/components/Game/Battle/Entities/types";

type Props = BattleEntityPositioning & {
  extraPunches: ExtraPunchVisual[];
  extraPunchSprite?: string;
  PLAYER_SIZE: number;
  isFacingLeft?: boolean;
};

export function ExtraPunch({
  extraPunches,
  extraPunchSprite,
  PLAYER_SIZE,
  battleScaleX,
  battleScaleY,
  isFacingLeft = false,
}: Props) {
  return (
    <>
      {extraPunches.map((p) => (
        <img
          key={p.id}
          src={extraPunchSprite}
          style={{
            position: "absolute",
            left: (p.x * battleScaleX) / (isFacingLeft ? 0.9 : 1.1),
            top: (p.y * battleScaleY) / 1.1,
            height: PLAYER_SIZE / 4,
            opacity: 0.5,
            width: "auto",
            transform: `translate(-50%, -100%) scaleX(${isFacingLeft ? -1 : 1})`,
            zIndex: 17,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}
