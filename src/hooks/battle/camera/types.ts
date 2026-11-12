export type BattleCameraParams = {
  containerWidth: number;
  containerHeight: number;
  screenWidth: number;
  initialBgPosRef: React.RefObject<{ x: number; y: number }>;
  player: { x: number; y: number };
  npc: {
    x: number;
    y: number;
    projectiles: Array<{
      variant?: string;
      detonatesOnHit?: boolean;
      impacted?: boolean;
      dirX: number;
      x: number;
    }>;
  };
  cameraFocus?: { entity?: string; zoom?: number } | null;
  sphereFocus?: { x: number; y: number } | null;
  mugetsuSweep?: { x: number } | null;
  domainExpansionActive: boolean;
  damageNumbers: unknown;
  groundShakeActive?: boolean;
  castActive: boolean;
  transformationFrame: number | null;
  battleScale?: number;
};
