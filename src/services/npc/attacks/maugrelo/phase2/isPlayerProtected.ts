import { ALL_STATES, unionOf } from "@/gameRules/battle/playerStates";

/**
 * Jogador protegido do laser de varredura do maugrelo (fase 2): agachado,
 * no ar, dash, habilidade aérea ou flutuando na Genki Dama.
 */
const PROTECTED_STATES = unionOf(
  ALL_STATES.CROUCHED_STATES,
  ALL_STATES.DASH_STATES,
  ALL_STATES.AIRBORNE_STATES,
  ALL_STATES.AIR_ABILITY_STATES,
  ALL_STATES.GENKI_DAMA_STATES,
);

export function isPlayerProtected(playerState: PlayerState): boolean {
  return PROTECTED_STATES.has(playerState);
}
