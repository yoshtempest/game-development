import { playerAbilityPath } from "@/utils/paths";

type Props = {
  net: { hp: number; maxHp: number; x: number; y: number } | null;
  battleScaleX: number;
  battleScaleY: number;
};

export function FishingNet({ net, battleScaleX, battleScaleY }: Props) {
  if (!net) return null;
  const ratio = net.maxHp > 0 ? Math.max(0, net.hp / net.maxHp) : 0;
  const src = playerAbilityPath("babidi", "fishingNet", "net.svg");
  return (
    <div
      style={{
        position: "absolute",
        left: net.x * battleScaleX,
        top: net.y * battleScaleY,
        transform: "translate(-79%, -65%)",
        zIndex: 16,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <div
        style={{
          width: 120,
          height: 12,
          background: "rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.6)",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${ratio * 100}%`,
            height: "100%",
            background: "linear-gradient(90deg, #4ade80, #22c55e)",
            transition: "width 0.1s linear",
          }}
        />
      </div>
      <div
        style={{
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          textShadow: "0 0 4px rgba(0,0,0,0.8)",
        }}
      >
        {Math.max(0, Math.round(net.hp))}/{net.maxHp}
      </div>
      <img
        src={src}
        style={{
          width: 300,
          height: 300,
          opacity: ratio,
        }}
        alt="fishing net"
      />
    </div>
  );
}