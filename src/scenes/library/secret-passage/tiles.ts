import {
  createConditionalTile,
  createDoorTile,
} from "@/scenes/shared/factories";
import {
  FOOTBALLCOURT_ROUTES,
  GUARD_BATTLE_ROUTES,
  LIBRARY_ROUTES,
} from "@/scenes/shared/routes";
import { hasFlag } from "@/scenes/shared/helpers";

/**
 * A saída para a quadra é guardada pelo Vigia Landô. Só o sentido
 * biblioteca → quadra é bloqueado: quem já chegou pela quadra volta livre,
 * para o vigia não prender o jogador dentro da passagem.
 */
export const secretPassageTiles = [
  createConditionalTile(8, 2, (_player, _quests, flags) =>
    hasFlag(flags, "vigiaLando")
      ? FOOTBALLCOURT_ROUTES.ONE
      : GUARD_BATTLE_ROUTES.LANDO,
  ),
  createDoorTile(8, 11, LIBRARY_ROUTES.TWO),
];
