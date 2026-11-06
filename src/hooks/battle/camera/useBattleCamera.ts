import { useEffect, useRef, useState } from "react";
import { useCameraShake } from "@/hooks/battle/effects/useCameraShake";
import { ProjectileConstants } from "@/data/projectile";
import { VASTOLORD_ROAR_SCREAM_FRAMES } from "@/data/characters/marshadow/vastolordForm";

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

export function useBattleCamera(params: BattleCameraParams) {
  const {
    containerWidth,
    containerHeight,
    screenWidth,
    initialBgPosRef,
    player,
    npc,
    cameraFocus,
    sphereFocus,
    mugetsuSweep,
    domainExpansionActive,
    damageNumbers,
    castActive,
    transformationFrame,
  } = params;

  const focusEntity = cameraFocus?.entity === "npc" ? npc : player;

  const focus = mugetsuSweep
    ? { x: mugetsuSweep.x, y: player.y }
    : sphereFocus
      ? { x: sphereFocus.x, y: sphereFocus.y }
      : { x: focusEntity.x, y: focusEntity.y };

  const bgXMin = initialBgPosRef.current.x;
  const maxOffsetX = screenWidth - containerWidth;
  const bgXMax = initialBgPosRef.current.x + (maxOffsetX * 200) / containerWidth;

  const targetBgX = Math.max(
    bgXMin,
    Math.min((focus.x / ProjectileConstants.MAP_WIDTH) * 100, bgXMax),
  );
  const targetBgY = Math.max(
    0,
    Math.min((focus.y / ProjectileConstants.MAP_HEIGHT) * 100, 100),
  );

  const [bgPosX, setBgPosX] = useState(targetBgX);
  const [bgPosY, setBgPosY] = useState(targetBgY);

  const bgTargetRef = useRef({ x: targetBgX, y: targetBgY });
  bgTargetRef.current.x = targetBgX;
  bgTargetRef.current.y = targetBgY;

  const worldOffsetX =
    (containerWidth * 0.5 * (bgPosX - initialBgPosRef.current.x)) / 100;
  const worldOffsetY =
    (containerHeight * 0.5 * (bgPosY - initialBgPosRef.current.y)) / 100;

  const baseZoom = sphereFocus ? 1 : (cameraFocus?.zoom ?? 1);
  const domainZoom = domainExpansionActive ? 1 / 1.4 : 1;
  const zoomTarget = baseZoom * domainZoom;

  const [zoom, setZoom] = useState(zoomTarget);
  const zoomTargetRef = useRef(zoomTarget);
  zoomTargetRef.current = zoomTarget;

  useEffect(() => {
    const dx = Math.abs(bgPosX - bgTargetRef.current.x);
    const dy = Math.abs(bgPosY - bgTargetRef.current.y);
    if (dx < 0.5 && dy < 0.5) {
      if (
        bgPosX !== bgTargetRef.current.x ||
        bgPosY !== bgTargetRef.current.y
      ) {
        setBgPosX(bgTargetRef.current.x);
        setBgPosY(bgTargetRef.current.y);
      }
      return;
    }

    const id = requestAnimationFrame(() => {
      setBgPosX((prev) => {
        const t = bgTargetRef.current.x;
        const next = prev + (t - prev) * 0.1;
        return Math.abs(next - t) < 0.5 ? t : next;
      });
      setBgPosY((prev) => {
        const t = bgTargetRef.current.y;
        const next = prev + (t - prev) * 0.1;
        return Math.abs(next - t) < 0.5 ? t : next;
      });
    });

    return () => cancelAnimationFrame(id);
  }, [bgPosX, bgPosY]);

  useEffect(() => {
    const diff = Math.abs(zoom - zoomTargetRef.current);
    if (diff < 0.001) {
      if (zoom !== zoomTargetRef.current) {
        setZoom(zoomTargetRef.current);
      }
      return;
    }

    const id = requestAnimationFrame(() => {
      setZoom((prev) => {
        const t = zoomTargetRef.current;
        const next = prev + (t - prev) * 0.12;
        return Math.abs(next - t) < 0.001 ? t : next;
      });
    });

    return () => cancelAnimationFrame(id);
  }, [zoom, zoomTarget]);

  const groundShakeActive =
    params.groundShakeActive ??
    npc.projectiles.some(
      (p) =>
        p.variant === "ground" &&
        p.detonatesOnHit === true &&
        !p.impacted &&
        (p.dirX > 0 ? p.x < player.x : p.x > player.x),
    );

  const screamShakeActive =
    transformationFrame != null &&
    transformationFrame < VASTOLORD_ROAR_SCREAM_FRAMES;

  const shake = useCameraShake(
    damageNumbers as never,
    groundShakeActive,
    castActive,
    screamShakeActive,
  );

  const bgBaseW = containerWidth * 1.5;
  const bgBaseH = containerHeight * 1.5;
  const focusScreenX = focus.x - (worldOffsetX + shake.x);
  const focusScreenY = focus.y - (worldOffsetY + shake.y);

  const denomX = containerWidth - zoom * bgBaseW;
  const denomY = containerHeight - zoom * bgBaseH;
  const adjustedBgX =
    denomX === 0
      ? bgPosX
      : (zoom * (containerWidth - bgBaseW) * bgPosX +
          100 * (1 - zoom) * focusScreenX) /
        denomX;
  const adjustedBgY =
    denomY === 0
      ? bgPosY
      : (zoom * (containerHeight - bgBaseH) * bgPosY +
          100 * (1 - zoom) * focusScreenY) /
        denomY;

  return {
    bgPosX,
    setBgPosX,
    bgPosY,
    setBgPosY,
    bgTargetRef,
    worldOffsetX,
    worldOffsetY,
    zoom,
    shake,
    adjustedBgX,
    adjustedBgY,
    focus,
  };
}