export type DashRefs = {
  progressRef: React.RefObject<Record<string, { level: number }>>;
  playerRef: React.RefObject<Player>;
  dashRef: React.RefObject<(dir: "left" | "right") => void>;
  lastLeftPressRef: React.RefObject<number>;
  lastRightPressRef: React.RefObject<number>;
  lastDashTimeRef: React.RefObject<number>;
};
