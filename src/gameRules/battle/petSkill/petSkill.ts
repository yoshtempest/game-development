import { PET_STAR_MULTIPLIER } from "@/data/characters/pets/petProgress";
import { getPetBaseDamage } from "@/data/characters/pets/petProgress";
import { NO_ARMOR } from "@/gameRules/battle/damage/armor";
import type { PetSkillDefinition } from "@/data/characters/pets/petSkills";

import type { DamageArmor } from "@/utils/types/battle/damageKind";
import type { PetSkillRunDeps } from "@/gameRules/battle/petSkill/types";
import { calcPetDamage } from "@/gameRules/battle/petSkill/calcPetDamage";
import { ONE_THOUSAND_MS } from "@/data/ms";
import { clampX } from "@/gameRules/movement/clampX";
import {
  getTsunamiFreezeMs,
  getTsunamiPushX,
} from "@/gameRules/battle/petSkill/tsunami";

/**
 * Quanto o hungryKing fica no sprite `invoking`: do caixão fechado até ele
 * abrir e o hungryDeath sair (`useCoffinAnimation` abre em 500 ms e começa o
 * fade em 1000 ms). Se a timeline do caixão mudar, este número acompanha.
 */
const HUNGRY_KING_INVOKE_MS = ONE_THOUSAND_MS;

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
    triggerPetInvoke,
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
    case "tsunami":
      runTsunami(def, effect, deps);
      break;
    case "blindTornado": {
      const now = Date.now();
      const blind = {
        until: now + effect.durationMs,
        missChance: effect.missChance,
      };
      if (battle.npcHP > 0) {
        deps.npcPetBlindRef.current = blind;
        spawnDamageRef.current?.(0, npc.x, npc.y, "blind");
      }
      const next = { ...deps.summonsPetBlindRef.current };
      for (const s of summons) {
        if (s.isDying || s.hp <= 0) continue;
        next[s.id] = blind;
        spawnDamageRef.current?.(0, s.x, s.y, "blind");
      }
      deps.summonsPetBlindRef.current = next;
      break;
    }
    case "summon": {
      if (def.petId === "pet_hungryKing") {
        const starMultiplier = PET_STAR_MULTIPLIER ** (petStars - 1);
        triggerPetInvoke(HUNGRY_KING_INVOKE_MS);
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

type TsunamiEffect = Extract<
  PetSkillDefinition["skillEffect"],
  { kind: "tsunami" }
>;

/**
 * Tsunami do Leviathan (issue #179): acerta o NPC principal e todo summon
 * inimigo vivo de uma vez. Para cada alvo, na ordem: empurra para longe do
 * player (clamp na arena), aplica o dano pelo funil do pet (`calcPetDamage`,
 * armadura do próprio alvo antes do elemento) e rola o congelamento, cuja
 * duração cai com a vida máxima do alvo (`getTsunamiFreezeMs`).
 *
 * O congelamento do NPC principal é o mesmo `freeze` do encantamento de arma
 * (`npcEnchantUntilRef` + `npcStaggerRef`); summon não tem stagger, então o
 * congelamento dele é a raiz (`rootedSummonsUntilRef`), que já para a IA.
 */
function runTsunami(
  def: PetSkillDefinition,
  effect: TsunamiEffect,
  deps: PetSkillRunDeps,
): void {
  const {
    petLevel,
    petStars,
    npcType,
    playerX,
    battle,
    spawnDamageRef,
    npc,
    summons,
    setSummons,
    rootedSummonsUntilRef,
    npcEnchantUntilRef,
    npcStaggerRef,
  } = deps;
  const baseDamage = getPetBaseDamage(petLevel, petStars);
  const now = Date.now();

  if (battle.npcHP > 0) {
    const dmg = calcPetDamage({
      baseDamage,
      multiplier: effect.multiplier,
      damageType: effect.damageType,
      armor: battle.npcArmor,
      petNpcType: def.npcType,
      targetNpcType: npcType,
    });
    const pushedX = clampX(
      getTsunamiPushX(npc.x, playerX, effect.pushDistance),
    );
    npc.updateNpc({ x: pushedX });
    battle.setNpcHP((hp) => Math.max(0, hp - dmg));
    spawnDamageRef.current?.(dmg, pushedX, npc.y, "pet");

    if (Math.random() < effect.freezeChance) {
      const until = now + getTsunamiFreezeMs(battle.npcMaxHp);
      npcEnchantUntilRef.current.freeze = Math.max(
        npcEnchantUntilRef.current.freeze,
        until,
      );
      npcStaggerRef.current = Math.max(npcStaggerRef.current, until);
      spawnDamageRef.current?.(0, pushedX, npc.y, "freeze");
    }
  }

  const hits: { id: string; dmg: number; x: number; frozenMs: number }[] = [];
  for (const s of summons) {
    if (s.isDying || s.hp <= 0) continue;
    const dmg = calcPetDamage({
      baseDamage,
      multiplier: effect.multiplier,
      damageType: effect.damageType,
      armor: s.armor as DamageArmor,
      petNpcType: def.npcType,
      targetNpcType: s.npcType,
    });
    const frozenMs =
      Math.random() < effect.freezeChance ? getTsunamiFreezeMs(s.maxHp) : 0;
    const x = clampX(getTsunamiPushX(s.x, playerX, effect.pushDistance));
    hits.push({ id: s.id, dmg, x, frozenMs });
    spawnDamageRef.current?.(dmg, x, s.y, "pet");
    if (frozenMs > 0) spawnDamageRef.current?.(0, x, s.y, "freeze");
  }
  if (hits.length === 0) return;

  const nextRooted = { ...rootedSummonsUntilRef.current };
  for (const hit of hits) {
    if (hit.frozenMs <= 0) continue;
    nextRooted[hit.id] = Math.max(nextRooted[hit.id] ?? 0, now + hit.frozenMs);
  }
  rootedSummonsUntilRef.current = nextRooted;

  const byId = new Map(hits.map((hit) => [hit.id, hit]));
  setSummons((prev) =>
    prev.map((s) => {
      const hit = byId.get(s.id);
      return hit ? { ...s, x: hit.x, hp: Math.max(0, s.hp - hit.dmg) } : s;
    }),
  );
}
