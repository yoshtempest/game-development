import {
  SPHERE_OFFSET_X,
  SPHERE_OFFSET_Y,
  SPHERE_SPAWN_SCALE,
} from "@/data/characters/natsuki/natsuki";
import type {
  NatsukiSphere,
  NatsukiSphereVariant,
} from "@/utils/types/character/natsuki";

/**
 * Frame inicial da esfera no instante do cast, antes do Setup compartilhado
 * (`spawning` → `moving`).
 *
 * A purple nasce da FUSÃO: começa no `junction` com a blue e a red já
 * posicionadas dos lados da cabeça, convergindo para o centro.
 */
export function createSphereFrame(
  variant: NatsukiSphereVariant,
  player: Player,
): NatsukiSphere {
  const isPurple = variant === "purple";
  const forward = player.battleDirection === "right" ? 1 : -1;

  return {
    variant,
    phase: isPurple ? "junction" : "spawning",
    x: player.x,
    y: player.y - SPHERE_OFFSET_Y,
    scale: isPurple ? 1 : SPHERE_SPAWN_SCALE,
    blink: isPurple ? 0 : 1,
    opacity: 1,
    direction: player.battleDirection,
    ...(isPurple
      ? {
          blueX: player.x - forward * SPHERE_OFFSET_X,
          blueY: player.y - SPHERE_OFFSET_Y,
          redX: player.x + forward * SPHERE_OFFSET_X,
          redY: player.y - SPHERE_OFFSET_Y,
        }
      : {}),
  };
}
