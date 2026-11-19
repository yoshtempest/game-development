import { combatService } from "@/services/combat";
import { getCharacterPassive } from "@/data/characters/passives";
import type { CharacterId } from "@/data/characters/list";

/**
 * Multiplicador da passiva Berserk sobre o dano que o player causa.
 *
 * Existe para os três funis de dano do player (`computeHitDamage`,
 * `damageSummon` e `useDash`) lerem a mesma verdade que o menu de Status
 * exibe: quem tem a passiva e em que nível ela libera vêm de
 * `CHARACTER_PASSIVES`, não de um `character === "samurion"` repetido em cada
 * caminho. A curva fica em `CombatService.getBerserkMultiplier` (1x com vida
 * cheia até 2x com 10% de HP ou menos).
 *
 * Devolve 1 quando o personagem não tem a passiva ou ainda não chegou ao nível
 * de desbloqueio, para o chamador multiplicar sem ramificar.
 */
export function getPlayerBerserkMultiplier(
  characterId: CharacterId,
  level: number,
  currentHP: number,
  maxHP: number,
): number {
  const passive = getCharacterPassive(characterId, "berserk");
  if (!passive || level < passive.unlockedAtLevel) return 1;
  return combatService.getBerserkMultiplier(currentHP, maxHP);
}
