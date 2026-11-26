import {
  createConditionalTile,
  createDoorTile,
} from "@/scenes/shared/factories";
import {
  HALL_ROUTES,
  LIBRARY_ROUTES,
  BRODICLASS_ROUTES,
  GUARD_BATTLE_ROUTES,
} from "@/scenes/shared/routes";
import { hasFlag, hasQuest } from "@/scenes/shared/helpers";
import type { TileRouteFunction } from "@/scenes/shared/types";

/**
 * Porta da biblioteca guardada pelo Vigia Joaquim: enquanto ele não foi
 * derrotado, entrar na porta abre a batalha em vez de levar à biblioteca.
 */
const getLibraryRoute: TileRouteFunction = (_player, _quests, flags) =>
  hasFlag(flags, "vigiaJoaquim")
    ? LIBRARY_ROUTES.ONE
    : GUARD_BATTLE_ROUTES.JOAQUIM;

export const hallThirdClassTiles = [
  createConditionalTile(
    3,
    7,
    (_player, quests) => {
      if (hasQuest(quests, "go_to_brodiclass")) {
        return BRODICLASS_ROUTES.ONE;
      }
      return null;
    },
    {
      blockedMessage:
        "Uma reunião do conselho está acontecendo no momento, volte mais tarde",
    },
  ),
  createConditionalTile(9, 2, getLibraryRoute),
  createConditionalTile(10, 2, getLibraryRoute),
  createDoorTile(8, 12, HALL_ROUTES.CENTER_FRONT),
  createDoorTile(9, 12, HALL_ROUTES.CENTER_FRONT),
  createDoorTile(10, 12, HALL_ROUTES.CENTER_FRONT),
];
