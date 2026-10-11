import type { RiquelmeSphere } from "@/utils/types/character/riquelme";
import { playerProjectilePath } from "@/utils/paths";
import styles from "./styles.module.css";

type Props = {
  sphere: RiquelmeSphere | null;
  battleScaleX: number;
  battleScaleY: number;
};

export function RiquelmeSphere({ sphere, battleScaleX, battleScaleY }: Props) {
  if (!sphere) return null;

  const src =
    sphere.variant === "blue"
      ? playerProjectilePath("blueSphere.svg")
      : playerProjectilePath("redSphere.svg");

  const blinkOpacity = sphere.blink;
  return (
    <div
      className={styles.container}
      style={{
        left: `${sphere.x * battleScaleX}px`,
        bottom: `${sphere.y * battleScaleY}px`,
        transform: `translateX(-50%) translateY(50%) scale(${sphere.scale})`,
        opacity: sphere.opacity,
      }}
    >
      <img
        className={styles.image}
        src={src}
        alt="Esfera do Riquelme"
        style={{
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
          className={styles.silhouette}
          src={src}
          alt="Esfera do Riquelme (silhueta)"
          style={{ opacity: blinkOpacity }}
        />
      )}
    </div>
  );
}
