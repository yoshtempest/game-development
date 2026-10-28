import { useEffect, useRef } from "react";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { logPlay } from "@/utils/replay/audioEventLog";
import { playerPath } from "@/utils/paths";
import { ProjectileConstants } from "@/data/projectile";
import { getViewportSize } from "@/utils/viewport";
import styles from "./styles.module.css";

type Props = {
  active: boolean;
  frame: string | null;
  npcX: number;
  npcY: number;
  npcHeight: number;
};

export function KokusenAnimation({
  active,
  frame,
  npcX,
  npcY,
  npcHeight,
}: Props) {
  const { playSound } = useSoundEffects();
  const soundPlayedRef = useRef(false);

  useEffect(() => {
    if (active && !soundPlayedRef.current) {
      soundPlayedRef.current = true;
      playSound("kokusen");
      logPlay("kokusen");
    }
    if (!active) {
      soundPlayedRef.current = false;
    }
  }, [active, playSound]);

  if (!active || !frame) return null;

  const scaleX = getViewportSize().width / ProjectileConstants.MAP_WIDTH;
  const scaleY = getViewportSize().height / ProjectileConstants.MAP_HEIGHT;

  const src = playerPath(`/natsuki/inFight/attacks/kokusen/${frame}.svg`);

  return (
    <img
      src={src}
      className={styles.overlay}
      style={{
        left: npcX * scaleX,
        top: npcY * scaleY - npcHeight * 0.6,
        transform: "translate(-50%, -50%)",
      }}
    />
  );
}
