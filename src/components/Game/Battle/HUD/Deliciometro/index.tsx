import { rootAssetPath } from "@/utils/paths";
import { useEffect, useRef } from "react";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import styles from "./styles.module.css";

type Props = {
  delicia: number; // 0 - 9
  hitsToSpecial?: number;
};

export function Deliciometro({ delicia, hitsToSpecial = 9 }: Props) {
  const angle = (delicia / hitsToSpecial) * 180 - 90;
  const charge = Math.min(1, delicia / hitsToSpecial);
  const isFull = delicia >= hitsToSpecial;

  const hasPlayedRef = useRef(false);
  const { playSound } = useSoundEffects();

  useEffect(() => {
    if (delicia >= hitsToSpecial && !hasPlayedRef.current) {
      hasPlayedRef.current = true;

      playSound("deliciometroIsFull");
    }

    // 🔄 reset quando diminuir
    if (delicia < hitsToSpecial) {
      hasPlayedRef.current = false;
    }
  }, [delicia, hitsToSpecial, playSound]);

  return (
    <div
      className={`${styles.container} ${isFull ? styles.fullContainer : ""}`}
    >
      <div
        className={`${styles.border} ${isFull ? styles.full : ""}`}
        style={{
          opacity: 0.4 + charge * 0.9,
          padding: `${1 + charge * 2}px`,
        }}
      />
      <img loading="lazy" decoding="async" src={rootAssetPath("deliciometro.svg")} className={styles.image} />
      <div
        className={styles.needle}
        style={{
          transform: `translateX(-50%) translateY(50%) rotate(${angle}deg)`,
        }}
      />
    </div>
  );
}
