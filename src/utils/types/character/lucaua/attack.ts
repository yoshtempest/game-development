/**
 * Tipos do ataque básico do lucaua: o golpe é um projétil de energia
 * (`energyAttack.svg`) disparado da mão — uma mão por vez (alternando entre
 * `leftHandAttack`/`rightHandAttack`) ou as duas (`bothSidesAttack`) quando há
 * inimigos dos dois lados do player.
 */

/** Variante do básico do lucaua: pose da mão do sprite de ataque. */
export type LucauaAttackVariant = "left" | "right" | "both";

/** Um disparo do plano: direção e posição de spawn no mapa da batalha. */
export type LucauaAttackShot = {
  dirX: 1 | -1;
  spawnX: number;
  spawnY: number;
};

/** Plano do básico do lucaua: sprite de ataque + os projéteis a gerar. */
export type LucauaAttackPlan = {
  variant: LucauaAttackVariant;
  shots: LucauaAttackShot[];
};