import { ProjectileConstants } from "@/data/projectile";
import { PLAYER_SPRITE_DIVISOR } from "@/data/grid";
import {
  EMATRON_KI_CHARGE_EFFECT_ASPECT,
  EMATRON_KI_CHARGE_EFFECT_SIZE_MULTIPLIER,
} from "@/data/characters/ematron";
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
    height * EMATRON_KI_CHARGE_EFFECT_SIZE_MULTIPLIER;

  const chargingEffectWidth =
    chargingEffectHeight / EMATRON_KI_CHARGE_EFFECT_ASPECT;

  return {
    scaleX,
    scaleY,
    width,
    height,
    chargingEffectWidth,
    chargingEffectHeight,
  };
}
