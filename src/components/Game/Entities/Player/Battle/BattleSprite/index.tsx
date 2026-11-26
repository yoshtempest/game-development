import { motion } from "motion/react";

import styles from "./styles.module.css";

interface BattleSpriteProps {
  src: string;
  className?: string;
  blinkDuration?: string;
  transform: string;
  transformOrigin?: string;
  onError: () => void;
  isIdle?: boolean;
  /**
   * Tinge o sprite de roxo (veneno, issue #42). A camada usa o próprio sprite
   * como máscara, então só a silhueta do personagem é tingida — um `filter`
   * no `<img>` brigaria com as animações de blink que já usam `filter`.
   */
  poisonTint?: boolean;
}

export function BattleSprite({
  src,
  className = "",
  blinkDuration,
  transform,
  transformOrigin,
  onError,
  isIdle = false,
  poisonTint = false,
}: BattleSpriteProps) {
  return (
    <div
      style={{
        position: "absolute",
        width: "max-content",
        height: "100%",
        left: "50%",
        bottom: 0,
        transform,
        transformOrigin,
        pointerEvents: "none",
      }}
    >
      <motion.img
        src={src}
        onError={onError}
        className={className}
        alt=""
        animate={
          isIdle
            ? {
                y: [0, -1.5, 0],
                rotate: [0, 0.25, 0, -0.25, 0],
                scaleY: [1, 1.005, 1],
              }
            : {
                y: 0,
                rotate: 0,
                scaleY: 1,
              }
        }
        transition={
          isIdle
            ? {
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : {
                duration: 0.2,
                ease: "easeOut",
              }
        }
        style={{
          display: "block",
          width: "auto",
          height: "100%",
          transformOrigin: "center bottom",
          animationDuration: blinkDuration,
        }}
      />
      {poisonTint && (
        <div
          aria-hidden
          className={styles.poisonTint}
          style={{
            maskImage: `url("${src}")`,
            WebkitMaskImage: `url("${src}")`,
          }}
        />
      )}
    </div>
  );
}
