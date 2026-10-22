import type { LaserBeam } from "@/services/npc/attacks/maugrelo/state";
import type { BattleEntityPositioning } from "@/components/Game/Battle/Entities/types";

type Props = BattleEntityPositioning & {
  laser: LaserBeam | null;
};

export function Laser({ laser, battleScaleX, battleScaleY }: Props) {
  if (!laser || !laser.active) return null;

  const left = Math.min(laser.fromX, laser.toX) * battleScaleX - 70;
  const width = Math.abs(laser.toX - laser.fromX) * battleScaleX;
  const top = laser.fromY * battleScaleY + 5;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height: 14,
        background:
          "linear-gradient(90deg, rgba(255,0,0,0.9), rgba(255,60,0,0.7))",
        boxShadow: "0 0 14px 4px rgba(255,0,0,0.8)",
        borderRadius: 4,
        zIndex: 6,
        pointerEvents: "none",
      }}
    />
  );
}
