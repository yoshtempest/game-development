import { NPCS } from "@/data/npc";
import { getNpcStats } from "@/gameRules/npc/npcStats";
import { getNpcVsPlayerMultiplier } from "@/gameRules/battle/npcVsPlayerDamage";
import { atLeastMinDamage } from "@/gameRules/battle/damage/minDamage";

import { combatService } from "@/services/combat";
import type { DamageKind } from "@/utils/types/battle/damageKind";

/**
 * Natureza do golpe de um summon inimigo. Fica aqui porque a mesma natureza
 * precisa valer em dois lugares: a conta elemental (`computeSummonDamage`) e a
 * redução de armadura (`damagePlayer` no `useExternal`) — passar uma coisa num
 * e outra no outro faria o summon furar a coluna errada.
 */
export const SUMMON_DAMAGE_KIND: DamageKind = "physical";

export function computeSummonDamage(
  s: SummonedNpc,
  npcLevel: number,
  difficulty: NpcDifficulty,
  playerClass: PlayerClass,
  playerCharacter: CharacterId,
): number | null {
  const data = NPCS[s.npcType];
  if (!data) return null;

  const stats = getNpcStats(
    s.level ?? npcLevel,
    data.class,
    difficulty,
    s.statMultiplier ?? 1,
    s.npcType,
  );

  // O conjure define o dano do summon, mas a criatura invocada tem tipagem
  // própria: `getNpcVsPlayerMultiplier` aplica o elemento do NPC contra o do
  // player — invocar não pode ser o jeito de burlar a tabela elemental.
  return atLeastMinDamage(
    combatService.calculateNpcDamage(
      stats.damage,
      SUMMON_DAMAGE_KIND,
      playerClass,
    ) * getNpcVsPlayerMultiplier(s.npcType, playerCharacter),
  );
}
