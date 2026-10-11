import type { RefObject } from "react";
import type { SoundId } from "@/utils/audio/soundId";

import { PET_STAR_MULTIPLIER } from "@/data/characters/pets/petProgress";
import { getPetBaseDamage } from "@/data/characters/pets/petProgress";
import { getNpcElementTypes } from "@/data/types/npcElementTypes";
import { combatService } from "@/services/combat";
import { atLeastMinDamage } from "@/gameRules/battle/damage/minDamage";
import { NO_ARMOR } from "@/gameRules/battle/damage/armor";
import type { PetSkillDefinition } from "@/data/characters/pets/petSkills";
import type { SummonedNpc } from "@/utils/types/npc/npc";
import type { SpawnDamageFn } from "@/utils/types/battle/spawnDamageFn";
import type { DamageArmor, DamageKind } from "@/utils/types/battle/damageKind";

/**
 * Dano de um golpe de pet: armadura pela natureza do golpe primeiro (mesma
 * ordem do funil player → NPC) e só depois a tabela elemental. Sem isto o pet
 * ignoraria a armadura mágica de um alvo elemental.
 */
function calcPetDamage(opts: {
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

export type PetSkillRunDeps = {
  petLevel: number;
  petStars: number;
  playerLevel: number;
  groundY: number;
  beginCoffinSequence: (
    spawnPositions: number[],
    groundY: number,
    npcType: string,
    onSpawn: (npcType: string, x: number) => void,
  ) => void;
  npcType: string;
  playerX: number;
  playerY: number;
  battle: {
    npcArmor: DamageArmor;
    npcHP: number;
    npcMaxHp: number;
    setNpcHP: React.Dispatch<React.SetStateAction<number>>;
    playerMaxHp: number;
    setPlayerHP: React.Dispatch<React.SetStateAction<number>>;
    setPlayerShield: React.Dispatch<React.SetStateAction<number>>;
  };
  spawnDamageRef: RefObject<SpawnDamageFn>;
  npc: { x: number; y: number };
  summonAlly: (
    npcType: string,
    overrideX?: number,
    options?: { level?: number; statMultiplier?: number },
  ) => void;
  triggerJumpAttack: (npcY: number, cb: (damage: number) => void) => void;
  triggerTeleportBite: (
    targetX: number,
    targetY: number,
    cb: (damage: number) => void,
  ) => void;
  applyNpcBleed: (durationMs: number) => void;
  summons: SummonedNpc[];
  setSummons: React.Dispatch<React.SetStateAction<SummonedNpc[]>>;
  summonsBleedUntilRef: RefObject<Record<string, number>>;
  npcRootedUntilRef: RefObject<number>;
  rootedSummonsUntilRef: RefObject<Record<string, number>>;
  rootDurationMs: number;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
};

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
      const targetArmor =
        target.id === "main"
          ? battle.npcArmor
          : (summons.find((s) => s.id === target.id)?.armor ?? NO_ARMOR);

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
