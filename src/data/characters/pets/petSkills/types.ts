import type { DamageKind } from "@/utils/types/battle/damageKind";

export type PetRole = "montaria" | "suporte" | "dano" | "tanker";

/**
 * Efeitos que batem no inimigo carregam a natureza do dano: decide qual coluna
 * da armadura do alvo o golpe fura. Ausente = física (mordida, salto, golpe).
 */
type PetSkillDamage = {
  multiplier: number;
  damageType?: DamageKind;
};

/**
 * `tsunami` (Leviathan) acerta todos os inimigos vivos de uma vez: empurra
 * `pushDistance` px para longe do player, dá dano e rola `freezeChance` de
 * congelar cada um. `blindTornado` (Peru) não dá dano: soma `missChance` à
 * chance de erro dos golpes de cada inimigo atingido contra o player por
 * `durationMs`.
 */
export type PetSkillEffect =
  | ({ kind: "damage" } & PetSkillDamage)
  | ({ kind: "jumpAttack" } & PetSkillDamage)
  | ({ kind: "teleportBite" } & PetSkillDamage & {
        bleedMs: number;
        /**
         * Dano por tick do sangramento com o pet em 1 estrela. Cada estrela a
         * mais multiplica por `PET_STAR_MULTIPLIER`, a mesma curva do dano base,
         * para o sangramento acompanhar a progressão do pet (issue #178).
         * Ausente usa o dano base de sangramento (`BASE_BLEED_TICK_DAMAGE`).
         */
        bleedTickDamage?: number;
      })
  | ({ kind: "tsunami" } & PetSkillDamage & {
        pushDistance: number;
        freezeChance: number;
      })
  | { kind: "blindTornado"; missChance: number; durationMs: number }
  | { kind: "summon"; npcType: string }
  /** Rapariga: sorteia um gato de `RAPARIGA_CATS` e aplica o efeito dele. */
  | { kind: "summonCat" }
  | { kind: "shield"; amount: number }
  | { kind: "heal"; amount: number }
  | { kind: "healPercent"; perStar: number[] };

export type PetPassiveEffect = { kind: "oneHitShield"; cooldownMs: number };

export type PetAbilityInfo = {
  name: string;
  description: string;
  cooldownMs: number;
};

export type PetSkillDefinition = {
  petId: string;
  name: string;
  role: PetRole;
  npcType: string;
  battleSprite: string;
  passive: PetAbilityInfo;
  passiveEffect?: PetPassiveEffect;
  skill: PetAbilityInfo;
  skillEffect: PetSkillEffect;
};
