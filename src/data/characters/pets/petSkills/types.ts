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
  | ({ kind: "teleportBite" } & PetSkillDamage & { bleedMs: number })
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
