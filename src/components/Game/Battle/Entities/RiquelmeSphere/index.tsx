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
  const screenMix = blinkOpacity > 0.05;
  return (
    <div
      className={styles.container}
      style={{
        left: `${sphere.x * battleScaleX}px`,
        top: `${sphere.y * battleScaleY}px`,
        transform: `translateX(-30%) translateY(-160%) scale(${sphere.scale})`,
        opacity: sphere.opacity,
      }}
    >
      <img
        className={styles.image}
        src={src}
        alt="Esfera do Riquelme"
        style={{
          opacity: Math.max(0, 1 - blinkOpacity),
          mixBlendMode: screenMix ? "screen" : "normal",
          filter: screenMix
            ? "brightness(6) saturate(1.6)"
            : "drop-shadow(0 4px 14px rgba(0,0,0,0.5))",
        }}
      />
      {screenMix && (
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
