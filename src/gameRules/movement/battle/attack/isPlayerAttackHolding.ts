import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";

/** SrGuaxinim fica travado (sem mover/crouch/dash) enquanto segura o ataque (attack.svg). */
export function isPlayerAttackHolding(player: Player) {
  return (
    player.character === "srGuaxinim" &&
    ALL_PREDICATES.isAttackPose(player.state)
  );
}
