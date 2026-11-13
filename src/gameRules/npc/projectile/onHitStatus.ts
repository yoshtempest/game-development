import type { NewPlayerStatus } from "@/utils/types/battle/status";

/**
 * Rola a chance de status de um projétil que acabou de acertar o player.
 *
 * Fica em `gameRules` (e não no handler do loop) para a regra ser uma só:
 * projétil sem `onHitStatus` nunca aplica nada, e a rolagem acontece uma vez
 * por acerto. `random` é injetável para a rolagem ser determinística fora do
 * jogo.
 *
 * @returns O status a aplicar, ou `undefined` quando a rolagem falha.
 */
export function rollProjectileOnHitStatus(
  projectile: Projectile,
  random: () => number = Math.random,
): NewPlayerStatus | undefined {
  if (projectile.variant !== "common" || !projectile.onHitStatus) {
    return undefined;
  }
  const { status, chance } = projectile.onHitStatus;
  return random() < chance ? status : undefined;
}
