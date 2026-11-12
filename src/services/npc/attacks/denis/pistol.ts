import { ProjectileHpConstants } from "@/data/projectile";
import { nextProjectileId } from "@/gameRules/npc/projectile/projectileId";

/**
 * Chumbo da pistola do Denis. Reaproveita o projétil terrestre com
 * `detonatesOnHit` (o mesmo da burst do hungryKing) porque a issue pede que o
 * chumbo **exploda ao contato** — esse é exatamente o caminho que já resolve
 * dano de impacto + empurrão via `onBurstHit`, sem um quarto funil de dano.
 */
export function createDenisLead(
  npcX: number,
  npcY: number,
  direction: "left" | "right",
  createdAt: number,
): ProjectileGround {
  const dirX = direction === "right" ? 1 : -1;
  return {
    variant: "ground",
    id: nextProjectileId(),
    x: npcX + dirX * 40,
    y: npcY - 60,
    dirX,
    createdAt,
    sprite: "denisLead",
    detonatesOnHit: true,
    impactSprite: "denisLeadExplosion",
    impacted: false,
    hp: ProjectileHpConstants.DEFAULT_HP,
    maxHp: ProjectileHpConstants.DEFAULT_HP,
    indestructible: false,
    damageType: "physical",
  };
}
