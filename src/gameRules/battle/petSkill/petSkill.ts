import { PET_STAR_MULTIPLIER } from "@/data/characters/pets/petProgress";
import { getPetBaseDamage } from "@/data/characters/pets/petProgress";
import { NO_ARMOR } from "@/gameRules/battle/damage/armor";
import type { PetSkillDefinition } from "@/data/characters/pets/petSkills";

import type { DamageArmor } from "@/utils/types/battle/damageKind";
import type { PetSkillRunDeps } from "@/gameRules/battle/petSkill/types";
import { calcPetDamage } from "@/gameRules/battle/petSkill/calcPetDamage";

export function runPetSkill(
  def: PetSkillDefinition,
  deps: PetSkillRunDeps,
): void {
  const {
    petLevel,
    petStars,
    playerLevel,
    groundY,
    beginCoffinSequence,
    npcType,
    playerX,
    playerY,
    battle,
    spawnDamageRef,
    npc,
    summonAlly,
    triggerJumpAttack,
    triggerTeleportBite,
    applyNpcBleed,
    summons,
    setSummons,
    summonsBleedUntilRef,
    npcRootedUntilRef,
    rootedSummonsUntilRef,
    rootDurationMs,
    playSound,
  } = deps;
  const effect = def.skillEffect;
  switch (effect.kind) {
    case "damage": {
      const baseDamage = getPetBaseDamage(petLevel, petStars);
      const dmg = calcPetDamage({
        baseDamage,
        multiplier: effect.multiplier,
        damageType: effect.damageType,
        armor: battle.npcArmor,
        petNpcType: def.npcType,
        targetNpcType: npcType,
      });
      battle.setNpcHP((hp) => Math.max(0, hp - dmg));
      spawnDamageRef.current?.(dmg, npc.x, npc.y, "pet");
      break;
    }
    case "jumpAttack": {
      const baseDamage = getPetBaseDamage(petLevel, petStars);
      const dmg = calcPetDamage({
        baseDamage,
        multiplier: effect.multiplier,
        damageType: effect.damageType,
        armor: battle.npcArmor,
        petNpcType: def.npcType,
        targetNpcType: npcType,
      });
      triggerJumpAttack(npc.y, () => {
        battle.setNpcHP((hp) => Math.max(0, hp - dmg));
        spawnDamageRef.current?.(dmg, npc.x, npc.y, "pet");
      });
      break;
    }
    case "teleportBite": {
      const baseDamage = getPetBaseDamage(petLevel, petStars);
      const enemies: {
        id: string;
        npcType: string;
        x: number;
        y: number;
        maxHp: number;
      }[] = [];
      if (battle.npcHP > 0) {
        enemies.push({
          id: "main",
          npcType,
          x: npc.x,
          y: npc.y,
          maxHp: battle.npcMaxHp,
        });
      }
      for (const s of summons) {
        if (s.isDying || s.hp <= 0) continue;
        enemies.push({
          id: s.id,
          npcType: s.npcType,
          x: s.x,
          y: s.y,
          maxHp: s.maxHp,
        });
      }
      if (enemies.length === 0) break;

      const target = enemies.reduce((best, e) =>
        e.maxHp > best.maxHp ? e : best,
      );

      // O alvo pode ser um summon: a armadura dele é a resolvida no spawn,
      // não a do NPC principal.
      const targetArmor = (
        target.id === "main"
          ? battle.npcArmor
          : (summons.find((s) => s.id === target.id)?.armor ?? NO_ARMOR)
      ) as DamageArmor;

      const dmg = calcPetDamage({
        baseDamage,
        multiplier: effect.multiplier,
        damageType: effect.damageType,
        armor: targetArmor,
        petNpcType: def.npcType,
        targetNpcType: target.npcType,
      });

      triggerTeleportBite(target.x, target.y, () => {
        if (target.id === "main") {
          battle.setNpcHP((hp) => Math.max(0, hp - dmg));
          applyNpcBleed(effect.bleedMs);
          npcRootedUntilRef.current = Date.now() + rootDurationMs;
          spawnDamageRef.current?.(dmg, target.x, target.y, "pet");
          return;
        }
        setSummons((prev) =>
          prev.map((s) =>
            s.id === target.id ? { ...s, hp: Math.max(0, s.hp - dmg) } : s,
          ),
        );
        summonsBleedUntilRef.current = {
          ...summonsBleedUntilRef.current,
          [target.id]: Math.max(
            summonsBleedUntilRef.current[target.id] ?? 0,
            Date.now() + effect.bleedMs,
          ),
        };
        rootedSummonsUntilRef.current = {
          ...rootedSummonsUntilRef.current,
          [target.id]: Math.max(
            rootedSummonsUntilRef.current[target.id] ?? 0,
            Date.now() + rootDurationMs,
          ),
        };
        spawnDamageRef.current?.(dmg, target.x, target.y, "pet");
      });
      break;
    }
    case "summon": {
      if (def.petId === "pet_hungryKing") {
        const starMultiplier = PET_STAR_MULTIPLIER ** (petStars - 1);
        beginCoffinSequence(
          [playerX + 200],
          groundY,
          effect.npcType,
          (_npcType: string, x: number) =>
            summonAlly(effect.npcType, x, {
              level: playerLevel,
              statMultiplier: starMultiplier,
            }),
        );
      } else {
        summonAlly(effect.npcType);
      }
      break;
    }
    case "shield":
      battle.setPlayerShield((shield) => shield + effect.amount);
      break;
    case "heal":
      battle.setPlayerHP((hp) =>
        Math.min(battle.playerMaxHp, hp + effect.amount),
      );
      spawnDamageRef.current?.(effect.amount, playerX, playerY - 40, "heal");
      break;
    case "healPercent": {
      const pct = effect.perStar[petStars - 1] ?? effect.perStar[0] ?? 0;
      const heal = Math.round((battle.playerMaxHp * pct) / 100);
      battle.setPlayerHP((hp) => Math.min(battle.playerMaxHp, hp + heal));
      spawnDamageRef.current?.(heal, playerX, playerY - 40, "heal");
      break;
    }
  }
  playSound("summon");
}
