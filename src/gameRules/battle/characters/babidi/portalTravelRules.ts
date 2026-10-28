import { BabidiPortalConstants } from "@/data/characters/babidi";
import { groundUnder } from "@/gameRules/battle/characters/babidi/portalGeometry";
import type { BabidiPortal } from "@/utils/types/character/babidi";
import type {
  EntityTravel,
  PlayerTravel,
  TravelAdvance,
} from "@/utils/types/character/babidi/portals";
import type { BattleObstacle } from "@/utils/types/maps/battle";

/**
 * Fundo do "buraco" de um portal terrestre: quanto abaixo da linha do portal a
 * entidade afunda antes de cruzar. O portal deitado abre um buraco no chão, e
 * descer essa profundidade é o que dá o tempo da travessia.
 */
export function groundFallTargetY(portal: BabidiPortal): number {
  return portal.y + BabidiPortalConstants.GROUND_FALL_DEPTH;
}

/**
 * Chão de pouso ao sair de um portal, ou `null` quando não há o que aterrissar.
 *
 * Só um destino suspenso (frontal/aéreo) precisa de queda: quem sai de um
 * portal terrestre já sai no chão. O `-1` evita reengatar queda por erro de
 * ponto flutuante quando o destino está praticamente encostado no chão.
 */
export function landingGround(
  dest: BabidiPortal,
  obstacles: BattleObstacle[],
): number | null {
  const ground = groundUnder(dest, obstacles);
  return dest.y < ground - 1 ? ground : null;
}

/**
 * Avança a queda simulada de uma entidade não-player por um tick.
 *
 * Função pura: devolve a queda seguinte (sem mutar a recebida) e a posição a
 * escrever. `crossed` marca o exato tick em que a entidade cruza para o outro
 * portal — é o momento do som, e só acontece uma vez por queda.
 */
export function advanceEntityTravel(
  travel: EntityTravel,
  obstacles: BattleObstacle[],
): TravelAdvance {
  const vy = travel.vy + BabidiPortalConstants.FALL_GRAVITY;
  const y = Math.min(travel.y + vy, travel.targetY);

  // Ainda afundando (ou caindo) até o alvo do tick.
  if (y < travel.targetY) {
    return { next: { ...travel, vy, y }, x: travel.x, y, crossed: false };
  }

  if (travel.phase === "descend") {
    // Chegou ao fundo do buraco: cruza e aparece no destino.
    const ground = landingGround(travel.dest, obstacles);
    if (ground !== null) {
      // Destino suspenso: continua caindo de lá até o chão.
      return {
        next: {
          ...travel,
          phase: "land",
          x: travel.dest.x,
          y: travel.dest.y,
          vy: 0,
          targetY: ground,
        },
        x: travel.dest.x,
        y: travel.dest.y,
        crossed: true,
      };
    }
    return { next: null, x: travel.dest.x, y: travel.dest.y, crossed: true };
  }

  // `land`: já pousou no chão do destino.
  return { next: null, x: travel.x, y: travel.targetY, crossed: false };
}

/**
 * A queda do player chegou ao fundo? Vale pelo `y` da física ou pelo teto de
 * tempo — se o chão interceptar o trajeto antes do alvo, a travessia dispara
 * sozinha para não prender o player na zona do portal.
 */
export function isPlayerTravelDone(
  travel: PlayerTravel,
  y: number,
  now: number,
): boolean {
  return (
    y >= travel.targetY - 1 ||
    now - travel.startTime >= BabidiPortalConstants.FALL_MAX_MS
  );
}
