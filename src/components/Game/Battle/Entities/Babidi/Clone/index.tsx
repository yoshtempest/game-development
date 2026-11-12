import { useEffect, useState } from "react";
import { npcPathProjectile, playerAbilityPath } from "@/utils/paths";
import styles from "./styles.module.css";
import type { BabidiCloneVisual } from "@/utils/types/character/babidi";

type Props = {
  clone: BabidiCloneVisual;
  battleScaleX: number;
  battleScaleY: number;
};

export function BabidiClone({ clone, battleScaleX, battleScaleY }: Props) {
  const [splitting, setSplitting] = useState(true);

  useEffect(() => {
    console.log("BabidiClone mount", clone.id, "splitting=", splitting);
    const t = setTimeout(() => {
      console.log("BabidiClone split done", clone.id);
      setSplitting(false);
    }, 500);
    return () => clearTimeout(t);
  }, [clone.id, clone.x, clone.y]); // eslint-disable-line react-hooks/exhaustive-deps

  if (clone.exploded) {
    return (
      <img
        loading="lazy"
        decoding="async"
        src={npcPathProjectile("/explosion.svg")}
        alt="explosion"
        style={{
          position: "absolute",
          left: clone.x * battleScaleX,
          top: clone.y * battleScaleY,
          transform: "translate(-50%, -50%)",
          width: 120,
          height: 120,
          zIndex: 16,
          pointerEvents: "none",
        }}
      />
    );
  }

  const src =
    clone.state === "run"
      ? playerAbilityPath("babidi", "passive", "cloneRun.svg")
      : playerAbilityPath("babidi", "passive", "cloneIdle.svg");

  return (
    <>
      {splitting && (
        <div
          className={styles.split}
          style={{
            left: clone.x * battleScaleX,
            top: clone.y * battleScaleY,
            transform: `translate(-50%, -100%) scaleX(${clone.flipped ? -1 : 1})`,
          }}
        >
          <img
            loading="lazy"
            decoding="async"
            className={`${styles.half} ${styles.left}`}
            src={src}
            alt=""
          />
          <img
            loading="lazy"
            decoding="async"
            className={`${styles.half} ${styles.right}`}
            src={src}
            alt=""
          />
        </div>
      )}
      <div
        style={{
          position: "absolute",
          left: clone.x * battleScaleX,
          top: clone.y * battleScaleY,
          transform: `scaleX(${clone.flipped ? -1 : 1})`,
          zIndex: 14,
          pointerEvents: "none",
        }}
      >
        <img
          loading="lazy"
          decoding="async"
          src={src}
          alt="babidi clone"
          className={styles.clone}
          style={{
            left: 0,
            top: 0,
          }}
        />
      </div>
    </>
  );
}
