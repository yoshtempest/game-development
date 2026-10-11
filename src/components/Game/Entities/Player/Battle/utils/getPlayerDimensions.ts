import { ProjectileConstants } from "@/data/projectile";
import { PLAYER_SPRITE_DIVISOR } from "@/data/grid";
import {
  EMANUEL_KI_CHARGE_EFFECT_ASPECT,
  EMANUEL_KI_CHARGE_EFFECT_SIZE_MULTIPLIER,
} from "@/data/characters/emanuel/emanuel";
import { getViewportSize } from "@/utils/viewport";

export interface PlayerDimensions {
  scaleX: number;
  scaleY: number;
  width: number;
  height: number;
  chargingEffectWidth: number;
  chargingEffectHeight: number;
}

export function getPlayerDimensions(playerSize: number): PlayerDimensions {
  const viewport = getViewportSize();

  const scaleX = viewport.width / ProjectileConstants.MAP_WIDTH;

  const scaleY = viewport.height / ProjectileConstants.MAP_HEIGHT;

  const scale = playerSize / ProjectileConstants.MAP_HEIGHT;

  const width = (ProjectileConstants.MAP_WIDTH * scale) / PLAYER_SPRITE_DIVISOR;

  const height =
    (ProjectileConstants.MAP_HEIGHT * scale) / PLAYER_SPRITE_DIVISOR;

  const chargingEffectHeight =
    height * EMANUEL_KI_CHARGE_EFFECT_SIZE_MULTIPLIER;

  const chargingEffectWidth =
    chargingEffectHeight / EMANUEL_KI_CHARGE_EFFECT_ASPECT;

  return {
    scaleX,
    scaleY,
    width,
    height,
    chargingEffectWidth,
    chargingEffectHeight,
  };
}
