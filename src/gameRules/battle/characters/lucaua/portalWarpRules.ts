import type { TimeKind } from "@/gameRules/battle/time";
import type {
  EntityTravel,
  PortalWarp,
} from "@/utils/types/character/lucaua/portals";
import type { LucauaPortal } from "@/utils/types/character/lucaua";
import { LucauaPortalConstants } from "@/data/characters/lucaua";
import { overlapsPortal } from "./portalGeometry";

export type PickWarpResult =
  | { kind: "none" }
  | { kind: "disarm" }
  | { kind: "arm"; warp: PortalWarp };

/**
 * Decide a travessia de uma entidade.
 *
 * Função pura: não modifica estado externo. O chamador é responsável por aplicar
 * os efeitos (adicionar/remover do `disarmed`).
 */
export function pickWarpDecision(
  id: string,
  x: number,
  feetY: number,
  portals: LucauaPortal[],
  disarmed: Set<string>,
): PickWarpResult {
  if (portals.length < LucauaPortalConstants.MAX_PORTALS) {
    return { kind: "none" };
  }

  const a = portals[0];
  const b = portals[1];
  if (!a || !b) return { kind: "none" };
  if (a.phase !== "placed" || b.phase !== "placed") return { kind: "none" };

  const inA = overlapsPortal(x, feetY, a);
  const inB = overlapsPortal(x, feetY, b);

  if (!inA && !inB) {
    return { kind: "disarm" };
  }

  if (disarmed.has(id)) {
    return { kind: "none" };
  }

  const warp: PortalWarp = inA ? { dest: b, source: a } : { dest: a, source: b };
  return { kind: "arm", warp };
}

// ── Congelamento seletivo da travessia ──────────────────────────────────────

/**
 * Especificação do efeito de time aplicado enquanto alguém atravessa um
 * portal: congela **só** as classes que têm alguém em travessia, isenta quem
 * da mesma classe ficou para trás e decide se o player (que não é
 * `TimeKind`) tem as ações travadas.
 */
export type TravelLockSpec = {
  /** Classes de entidade com alguém em travessia (as que congelam). */
  kinds: TimeKind[];
  /** Ids de entidades dessas classes que NÃO viajam — continuam vivas. */
  exempt: string[];
  /** O player é quem está caindo: trava só as ações dele, não o mundo. */
  lockPlayer: boolean;
};

/**
 * Constrói o congelamento seletivo de uma travessia.
 *
 * Por que por classe e não por id: `getTime` só sabe responder "esta entidade
 * está congelada?" consultando `kinds` (classe) + `exempt` (id). Congelar a
 * classe inteira manteria o AI parado de quem ficou — daí o `exempt` com os
 * rosters (summons/aliados) menos quem viaja.
 *
 * `npc` e `pet` são singletons: se viajam entram no `kinds` sem isenção (o
 * roster de ninguém é necessário); se não viajam a classe simplesmente não
 * aparece e o mundo segue. O pet sequer entra no `travelRef` (warp instantâneo).
 */
export function buildTravelLockSpec(
  travels: readonly EntityTravel[],
  playerTraveling: boolean,
  summons: readonly { id: string }[],
  allies: readonly { id: string }[],
): TravelLockSpec {
  const kinds = new Set<TimeKind>();
  const travelingSummons = new Set<string>();
  const travelingAllies = new Set<string>();

  for (const travel of travels) {
    kinds.add(travel.group);
    if (travel.group === "summon") travelingSummons.add(travel.id);
    else if (travel.group === "ally") travelingAllies.add(travel.id);
  }

  const exempt: string[] = [];
  if (kinds.has("summon")) {
    for (const summon of summons) {
      if (!travelingSummons.has(summon.id)) exempt.push(summon.id);
    }
  }
  if (kinds.has("ally")) {
    for (const ally of allies) {
      if (!travelingAllies.has(ally.id)) exempt.push(ally.id);
    }
  }

  return { kinds: [...kinds], exempt, lockPlayer: playerTraveling };
}