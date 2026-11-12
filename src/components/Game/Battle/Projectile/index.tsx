import { spriteMap } from "@/data/battle/projectileSprites";
import { ProjectileConstants } from "@/data/projectile";
import { getViewportSize } from "@/utils/viewport";
import { getSpriteKey } from "./getSpriteKey";
import renderHpBar from "./RenderHpBar";

type Props = {
  projectile: Projectile;
  groundY?: number;
};

export function ProjectileSprite({ projectile, groundY = 600 }: Props) {
  const scaleX = getViewportSize().width / ProjectileConstants.MAP_WIDTH;
  const scaleY = getViewportSize().height / ProjectileConstants.MAP_HEIGHT;
  const spriteKey = getSpriteKey(projectile);
  const src = spriteMap[spriteKey];
  const isGround = projectile.variant === "ground";
  const spriteWidth = isGround ? ProjectileConstants.GROUND_SPRITE_WIDTH : 100;
  // O projétil terrestre viaja com o centro do sprite alinhado à linha de voo,
  // subindo o visual até o centro do jogador (os outros seguem âncora top-left).
  const spriteTransform = isGround ? "translateY(-50%)" : undefined;

  if (projectile.variant === "cut") {
    return (
      <>
        <img
          loading="lazy"
          decoding="async"
          src={src}
          style={{
            position: "absolute",
            left: projectile.upper.x * scaleX,
            top: projectile.upper.y * scaleY,
            width: 50,
            clipPath: "polygon(0 0, 100% 0, 0 100%)",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        />
        <img
          loading="lazy"
          decoding="async"
          src={src}
          style={{
            position: "absolute",
            left: projectile.lower.x * scaleX,
            top: projectile.lower.y * scaleY,
            width: 50,
            clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        />
        {renderHpBar(
          projectile,
          projectile.upper.x,
          projectile.upper.y,
          scaleX,
          scaleY,
        )}
      </>
    );
  }

  if (projectile.variant === "rain") {
    const now = Date.now();
    const elapsed = now - projectile.warningStartTime;
    const isWarning = elapsed < projectile.warningDuration;

    if (isWarning) {
      return (
        <>
          {projectile.spears.map((spear, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: (spear.x - 30) * scaleX,
                top: groundY * scaleY,
                width: 60 * scaleX,
                height: 10 * scaleY,
                backgroundColor: "rgba(255, 0, 0, 0.5)",
                borderRadius: 100,
                zIndex: 9999,
                pointerEvents: "none",
              }}
            />
          ))}
        </>
      );
    }

    const leadSpear = projectile.spears[0];
    return (
      <>
        {projectile.spears.map((spear, i) => (
          <img
            loading="lazy"
            decoding="async"
            key={i}
            src={src}
            style={{
              position: "absolute",
              left: spear.x * scaleX,
              top: spear.y * scaleY,
              width: 60,
              transform: "scaleY(-1)",
              zIndex: 9999,
              pointerEvents: "none",
            }}
          />
        ))}
        {renderHpBar(
          projectile,
          leadSpear?.x ?? projectile.x,
          leadSpear?.y ?? 420,
          scaleX,
          scaleY,
        )}
      </>
    );
  }

  return (
    <>
      <img
        loading="lazy"
        decoding="async"
        src={src}
        style={{
          position: "absolute",
          left: projectile.x * scaleX,
          top: projectile.y * scaleY,
          width: spriteWidth,
          transform: spriteTransform,
          zIndex: 9999,
          pointerEvents: "none",
        }}
      />
      {renderHpBar(projectile, projectile.x, projectile.y, scaleX, scaleY)}
    </>
  );
}
