import { playerPath } from "@/utils/paths";
import { ProjectileConstants } from "@/data/projectile";
import { getViewportSize } from "@/utils/viewport";
import styles from "./styles.module.css";

type Props = {
  active: boolean;
  variant: string | null;
  playerX: number;
  playerY: number;
};

export function BlackFlashAnimation({
  active,
  variant,
  playerX,
  playerY,
}: Props) {
  if (!active || !variant) return null;

  const scaleX = getViewportSize().width / ProjectileConstants.MAP_WIDTH;
  const scaleY = getViewportSize().height / ProjectileConstants.MAP_HEIGHT;

  const src = playerPath(`/natsuki/inFight/attacks/blackFlash/${variant}.svg`);

  return (
    <img
      src={src}
      className={styles.overlay}
      style={{
        left: playerX * scaleX,
        top: playerY * scaleY,
        transform: "translate(-50%, -100%)",
      }}
    />
  );
}
