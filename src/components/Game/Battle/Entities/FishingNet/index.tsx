import { playerAbilityPath } from "@/utils/paths";

type Props = {
  net: { x: number; y: number } | null;
  battleScaleX: number;
  battleScaleY: number;
};

/**
 * Rede de pesca do Babidi: inquebrável, sem barra de vida. Apenas o sprite
 * da rede posicionado sobre o inimigo principal enquanto ele fica imobilizado.
 */
export function FishingNet({ net, battleScaleX, battleScaleY }: Props) {
  if (!net) return null;
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
      <img
        src={src}
        style={{
          width: 300,
          height: 300,
          opacity: 1,
        }}
        alt="fishing net"
      />
    </div>
  );
}