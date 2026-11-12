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

export type PetSkillEffect =
  | ({ kind: "damage" } & PetSkillDamage)
  | ({ kind: "jumpAttack" } & PetSkillDamage)
  | ({ kind: "teleportBite" } & PetSkillDamage & {
        bleedMs: number;
        /**
         * Dano por tick do sangramento com o pet em 1 estrela. Cada estrela a
         * mais multiplica por `PET_STAR_MULTIPLIER`, a mesma curva do dano base,
         * para o sangramento acompanhar a progressão do pet (issue #178).
         */
        bleedTickDamage: number;
      })
  | { kind: "summon"; npcType: string }
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
