import { getNpcElementTypes } from "@/data/types/npcElementTypes";
import { combatService } from "@/services/combat";
import { atLeastMinDamage } from "@/gameRules/battle/damage/minDamage";
import type { DamageArmor, DamageKind } from "@/utils/types/battle/damageKind";

/**
 * Dano de um golpe de pet: armadura pela natureza do golpe primeiro (mesma
 * ordem do funil player → NPC) e só depois a tabela elemental. Sem isto o pet
 * ignoraria a armadura mágica de um alvo elemental.
 */
export function calcPetDamage(opts: {
  baseDamage: number;
  multiplier: number;
  damageType?: DamageKind;
  armor: DamageArmor;
  petNpcType: string;
  targetNpcType: string;
}): number {
  const {
    baseDamage,
    multiplier,
    damageType,
    armor,
    petNpcType,
    targetNpcType,
  } = opts;

  const elementMultiplier = combatService.getElementMultiplier(
    getNpcElementTypes(petNpcType),
    getNpcElementTypes(targetNpcType),
  );

  return atLeastMinDamage(
    combatService.calculateDamageToNpc(
      baseDamage * multiplier,
      damageType ?? "physical",
      armor,
    ) * elementMultiplier,
  );
}