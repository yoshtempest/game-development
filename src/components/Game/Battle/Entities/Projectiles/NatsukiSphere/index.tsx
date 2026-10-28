import type { NatsukiSphere } from "@/utils/types/character/natsuki";
import { playerProjectilePath } from "@/utils/paths";
import styles from "./styles.module.css";

type Props = {
  sphere: NatsukiSphere | null;
  battleScaleX: number;
  battleScaleY: number;
};

/** Sprite da esfera pelo variant (blue/red/purple). */
function sphereSrc(variant: NatsukiSphere["variant"]): string {
  switch (variant) {
    case "blue":
      return playerProjectilePath("blueSphere.svg");
    case "red":
      return playerProjectilePath("redSphere.svg");
    case "purple":
      return playerProjectilePath("purpleSphere.svg");
  }
}

export function NatsukiSphere({ sphere, battleScaleX, battleScaleY }: Props) {
  if (!sphere) return null;

  // ── Junção da purple: a blue e a red convergem até a cabeça ──────────────
  // Mesmo desenho do `SpecialProjectile` (blue à esquerda/red à direita
  // conforme a mira); a esfera formada só aparece quando a fase vira
  // `spawning`.
  if (sphere.phase === "junction") {
    const blueSprite = playerProjectilePath("blueSphere.svg");
    const redSprite = playerProjectilePath("redSphere.svg");
    return (
      <>
        <img
          src={blueSprite}
          alt="Esfera azul"
          style={{
            position: "absolute",
            left: (sphere.blueX ?? sphere.x) * battleScaleX,
            top: (sphere.blueY ?? sphere.y) * battleScaleY,
            width: 40,
            transform: "translate(-50%, -50%)",
            zIndex: 15,
            pointerEvents: "none",
          }}
        />
        <img
          src={redSprite}
          alt="Esfera vermelha"
          style={{
            position: "absolute",
            left: (sphere.redX ?? sphere.x) * battleScaleX,
            top: (sphere.redY ?? sphere.y) * battleScaleY,
            width: 40,
            transform: "translate(-50%, -50%)",
            zIndex: 15,
            pointerEvents: "none",
          }}
        />
      </>
    );
  }

  const src = sphereSrc(sphere.variant);
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
        alt="Esfera do Natsuki"
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
          alt="Esfera do Natsuki (silhueta)"
          style={{ opacity: blinkOpacity }}
        />
      )}
    </div>
  );
}
