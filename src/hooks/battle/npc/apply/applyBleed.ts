import { isPlayerImmuneTo } from "@/gameRules/battle/status/statusEffects";

/**
 * Aplica sangramento dos NPCs que cortam.
 *
 * Sangramento não passa por `applyPlayerStatus` (não está em
 * `NewPlayerStatus`), então a imunidade da beterraba é checada aqui.
 */
export function applyBleed(
  npcType: string,
  tenacityReduction: number,
  setPlayer: React.Dispatch<React.SetStateAction<Player>>,
) {
  if (npcType === "hungryDeath" || npcType === "maurao") {
    const bleedMs = Math.round(5000 * (1 - tenacityReduction));
    setPlayer((p) =>
      isPlayerImmuneTo(p, "bleed")
        ? p
        : { ...p, bleedUntil: Date.now() + bleedMs },
    );
  }
}
