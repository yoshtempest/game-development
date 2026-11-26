import { createCommonProjectile } from "@/gameRules/npc/projectile/directionalProjectile";
import { tryThrowProjectile } from "@/gameRules/npc/projectile";
import { FOUR_THOUSAND_MS, THREE_HUNDRED_MS } from "@/data/ms";
import type { BehaviorContext } from "@/utils/types/npc/npcBehavior";

/**
 * Faixa de distância (em x) em que o hungryDog cospe ácido. Abaixo do mínimo
 * ele prefere a mordida; acima do máximo o cuspe sairia quase da borda e
 * viraria spam sem tempo de reação.
 */
export const ACID_SPIT_MIN_RANGE = 150;
export const ACID_SPIT_MAX_RANGE = 450;

/** Intervalo entre cuspes. */
export const ACID_SPIT_COOLDOWN_MS = FOUR_THOUSAND_MS;

/** Tempo parado após cuspir, antes de voltar a correr. */
export const ACID_SPIT_IDLE_MS = THREE_HUNDRED_MS;

/** Chance (0–1) do ácido envenenar o player a cada acerto. */
export const ACID_SPIT_POISON_CHANCE = 0.3;

/** Altura da boca do cão em relação ao `npc.y` (o projétil nasce nela). */
export const ACID_SPIT_MOUTH_OFFSET_Y = 60;

/** Chave do `spriteMap` para `public/assets/npcs/projectiles/acid.svg`. */
const ACID_SPIT_SPRITE = "acid";

/**
 * Cuspe ácido do hungryDog comum: projétil mágico, com chance de veneno, que
 * só sai a média distância e com cooldown próprio (`npc.ai.hungryDogSpit`).
 * O cooldown é separado do `lastAttackRef` da mordida para o cuspe não
 * atrasar o melee quando o jogador fecha a distância logo depois.
 *
 * O veneno não é aplicado aqui: o acerto é resolvido no loop de projéteis, que
 * rola `onHitStatus` e aplica via `applyPlayerStatus`.
 *
 * @returns `true` quando cuspiu neste tick.
 */
export function tryAcidSpit(ctx: BehaviorContext): boolean {
  const { npc, targetX, targetY, projectile, setProjectile, setForceIdle } =
    ctx;

  const distanceX = Math.abs(npc.x - targetX);
  if (distanceX < ACID_SPIT_MIN_RANGE || distanceX > ACID_SPIT_MAX_RANGE) {
    return false;
  }

  const ai = (npc.ai ??= {});
  const spitRef = (ai.hungryDogSpit ??= { current: 0 });

  return tryThrowProjectile({
    projectile,
    cooldown: ACID_SPIT_COOLDOWN_MS,
    lastAttackRef: spitRef,
    setProjectile,
    projectileData: createCommonProjectile({
      startX: npc.x,
      startY: npc.y - ACID_SPIT_MOUTH_OFFSET_Y,
      targetX,
      targetY: targetY - ACID_SPIT_MOUTH_OFFSET_Y,
      sprite: ACID_SPIT_SPRITE,
      state: "walk",
      damageType: "magical",
      onHitStatus: { status: "poison", chance: ACID_SPIT_POISON_CHANCE },
    }),
    setForceIdle,
    idleDuration: ACID_SPIT_IDLE_MS,
  });
}
