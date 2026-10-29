import type { CSSProperties, ReactNode } from "react";

import type { BattleEntityPositioning } from "@/components/Game/Battle/Entities/types";

import styles from "./styles.module.css";

type BeamPhase = "starting" | "active" | "ending";
type BeamDirection = "left" | "right";
type PulseAxis = "x" | "y";

interface Props extends BattleEntityPositioning {
  phase: BeamPhase;
  direction: BeamDirection;

  left: number;
  top: number;
  width: number;
  height: number;

  children: ReactNode;

  zIndex?: number;
  animationDuration?: number;
  pulseAxis?: PulseAxis;
  pulseScale?: number;

  className?: string;
  style?: CSSProperties;
}

export function BattleBeam({
  phase,
  direction,
  left,
  top,
  width,
  height,
  children,
  zIndex = 4,
  animationDuration = 500,
  pulseAxis = "x",
  pulseScale = 0.95,
  className,
  style,
}: Props) {
  const phaseClass =
    phase === "active"
      ? styles.active
      : phase === "starting"
        ? direction === "right"
          ? styles.startingLeft
          : styles.startingRight
        : direction === "right"
          ? styles.endingLeft
          : styles.endingRight;

  return (
    <div
      className={[
        styles.container,
        phaseClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          left,
          top,
          width,
          height,
          zIndex,
          "--beam-duration": `${animationDuration}ms`,
          "--pulse-scale": pulseScale,
          "--pulse-axis": pulseAxis === "x" ? "X" : "Y",
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}