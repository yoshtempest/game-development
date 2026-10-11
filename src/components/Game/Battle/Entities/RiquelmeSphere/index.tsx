import type { RiquelmeSphere } from "@/utils/types/character/riquelme";
import { playerProjectilePath } from "@/utils/paths";

type Props = {
  sphere: RiquelmeSphere | null;
  battleScaleX: number;
  battleScaleY: number;
};

export function RiquelmeSphere({ sphere, battleScaleX, battleScaleY }: Props) {
  if (!sphere) return null;

  const src =
    sphere.variant === "blue"
      ? playerProjectilePath("/blueSphere.svg")
      : playerProjectilePath("/redSphere.svg");

  const blinkOpacity = sphere.blink;
  return (
    <div
      style={{
        position: "absolute",
        left: `${sphere.x * battleScaleX}px`,
        bottom: `${sphere.y * battleScaleY}px`,
        transform: `translateX(-50%) translateY(50%) scale(${sphere.scale})`,
        transformOrigin: "center bottom",
        opacity: sphere.opacity,
        pointerEvents: "none",
        willChange: "transform, opacity",
        zIndex: 25,
      }}
    >
      <img
        src={src}
        alt="Esfera do Riquelme"
        style={{
          width: "80px",
          height: "auto",
          opacity: Math.max(0, 1 - blinkOpacity),
          mixBlendMode: blinkOpacity > 0.05 ? "screen" : "normal",
          filter:
            blinkOpacity > 0.05
              ? "brightness(5) saturate(1.4)"
              : "drop-shadow(0 4px 12px rgba(0,0,0,0.45))",
        }}
      />
      {blinkOpacity > 0.05 && (
        <img
          src={src}
          alt="Esfera do Riquelme (silhueta)"
          style={{
            position: "absolute",
            inset: 0,
            width: "80px",
            height: "auto",
            opacity: blinkOpacity,
            mixBlendMode: "screen",
            filter: "brightness(10)",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
