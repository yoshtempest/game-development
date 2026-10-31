import { playerAbilityPath } from "@/utils/paths";

type Props = {
  net: { hp: number; maxHp: number; x: number; y: number } | null;
  battleScaleX: number;
  battleScaleY: number;
};

export function FishingNet({ net, battleScaleX, battleScaleY }: Props) {
  if (!net) return null;
  const opacity = net.maxHp > 0 ? net.hp / net.maxHp : 0;
  const src = playerAbilityPath("babidi", "fishingNet", "net.svg");
  return (
    <img
      src={src}
      style={{
        position: "absolute",
        left: net.x * battleScaleX,
        top: net.y * battleScaleY,
        width: 300,
        height: 300,
        transform: "translate(-50%, -50%)",
        opacity,
        zIndex: 16,
        pointerEvents: "none",
      }}
    />
  );
}