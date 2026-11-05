import { npcPathProjectile, playerAbilityPath } from "@/utils/paths";
import type { BabidiCloneVisual } from "@/utils/types/character/babidi";

type Props = {
  clone: BabidiCloneVisual;
  battleScaleX: number;
  battleScaleY: number;
};

export function BabidiClone({ clone, battleScaleX, battleScaleY }: Props) {
  if (clone.exploded) {
    return (
      <img
        src={npcPathProjectile("/explosion.svg")}
        alt="explosion"
        style={{
          position: "absolute",
          left: clone.x * battleScaleX,
          top: clone.y * battleScaleY,
          transform: "translate(-50%, -50%)",
          width: 120,
          height: 120,
          zIndex: 16,
          pointerEvents: "none",
        }}
      />
    );
  }
  const src =
    clone.state === "run"
      ? playerAbilityPath("babidi", "passive", "cloneRun.svg")
      : playerAbilityPath("babidi", "passive", "cloneIdle.svg");
  return (
    <img
      src={src}
      alt="babidi clone"
      style={{
        position: "absolute",
        left: clone.x * battleScaleX,
        top: clone.y * battleScaleY,
        transform: "translate(-50%, -100%)",
        width: 80,
        height: 80,
        zIndex: 15,
        pointerEvents: "none",
      }}
    />
  );
}