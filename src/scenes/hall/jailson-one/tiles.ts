import { createConditionalTile } from "@/scenes/shared/factories";

import {
  GUARD_BATTLE_ROUTES,
  HALL_ROUTES,
  PROFESSOR_ROOM_ROUTES,
} from "@/scenes/shared/routes";
import { hasAnyQuest, hasFlag, hasQuest } from "@/scenes/shared/helpers";

export const jailsonOneTiles = [
  createConditionalTile(
    9,
    12,

    (_player, quests) => {
      if (
        hasAnyQuest(quests, ["letter_delivery", "help_jailson", "x1_slimita"])
      ) {
        return HALL_ROUTES.AFTER_PCROOM_ONE;
      }

      return HALL_ROUTES.ONE;
    },
  ),

  createConditionalTile(
    8,
    12,

    (_player, quests) => {
      if (
        hasAnyQuest(quests, ["letter_delivery", "help_jailson", "x1_slimita"])
      ) {
        return HALL_ROUTES.AFTER_PCROOM_ONE;
      }

      return HALL_ROUTES.ONE;
    },
  ),
  createConditionalTile(
    15,
    8,
    (_player, quests, flags) => {
      if (!hasQuest(quests, "x1_manim")) return null;
      if (!hasFlag(flags, "vigiaJoao")) return GUARD_BATTLE_ROUTES.JOAO;
      return PROFESSOR_ROOM_ROUTES.ONE;
    },
    {
      blockedMessage:
        "Sala dos professores, entrada bloqueada a alunos sem autorização.",
    },
  ),
];
