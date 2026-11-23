import { getPetBaseDamage } from "@/data/characters/pets/petProgress";
import {
  pickRaparigaCat,
  RAPARIGA_CATS,
} from "@/data/characters/pets/petSkills";
import type { RaparigaCatId } from "@/data/characters/pets/petSkills";

import type { DamageKind } from "@/utils/types/battle/damageKind";
import type { PetSkillRunDeps } from "@/gameRules/battle/petSkill/types";
import { calcPetDamage } from "@/gameRules/battle/petSkill/calcPetDamage";

/**
 * Executa a habilidade da Rapariga: sorteia um gato e aplica o efeito dele.
 *
 * O efeito é imediato e reaproveita os funis existentes (`calcPetDamage`,
 * `setPlayerHP`, `setPlayerShield`, `applyNpcBleed`) em vez de spawnar um
 * aliado com IA própria: cada gato como aliado em campo exigiria um `NpcType`
 * por gato (attack, multiplicadores, sprites por estado), o que fica para uma
 * segunda fatia da issue #477.
 *
 * O dano usa a tipagem elemental da própria Rapariga (`petNpcType`), porque é
 * ela quem conjura o gato.
 *
 * Returns:
 *   O id do gato sorteado, para quem chamar exibir/registrar a invocação.
 */
export function runRaparigaCat(
  petNpcType: string,
  deps: PetSkillRunDeps,
  random: () => number = Math.random,
): RaparigaCatId {
  const { petLevel, petStars, npcType, battle, spawnDamageRef, npc } = deps;
  const catId = pickRaparigaCat(random);
  const effect = RAPARIGA_CATS[catId].effect;

  function hitNpc(
    multiplier: number,
    damageType: DamageKind | undefined,
  ): void {
    const dmg = calcPetDamage({
      baseDamage: getPetBaseDamage(petLevel, petStars),
      multiplier,
      damageType,
      armor: battle.npcArmor,
      petNpcType,
      targetNpcType: npcType,
    });
    battle.setNpcHP((hp) => Math.max(0, hp - dmg));
    spawnDamageRef.current?.(dmg, npc.x, npc.y, "pet");
  }

  function healPlayer(amount: number): void {
    battle.setPlayerHP((hp) => Math.min(battle.playerMaxHp, hp + amount));
    spawnDamageRef.current?.(amount, deps.playerX, deps.playerY - 40, "heal");
  }

  switch (effect.kind) {
    case "damage":
      hitNpc(
        effect.multiplier,
        "damageType" in effect ? effect.damageType : undefined,
      );
      if ("bleedMs" in effect) deps.applyNpcBleed(effect.bleedMs);
      break;
    case "gamble":
      if (random() < effect.chance) {
        hitNpc(effect.multiplier, effect.damageType);
      }
      break;
    case "heal":
      healPlayer(effect.amount);
      break;
    case "healPercent":
      healPlayer(Math.round((battle.playerMaxHp * effect.percent) / 100));
      break;
    case "shield":
      battle.setPlayerShield((shield) => shield + effect.amount);
      break;
  }
  return catId;
}
