/** Braços/armas equipáveis pela Drika durante a batalha, por troca via Sigilo. */
export const DRIKA_ARMS = [
  "withAngelBlades",
  "withKnife",
  "withPistol",
  "withScythe",
] as const;

export type DrikaArm = (typeof DRIKA_ARMS)[number];

/** Braço inicial da Drika no começo da batalha. */
export const DEFAULT_DRIKA_ARM: DrikaArm = "withAngelBlades";

/** Nomes amigáveis dos braços da Drika. */
export const DRIKA_ARM_LABELS: Record<DrikaArm, string> = {
  withAngelBlades: "Lâminas Angelicais",
  withKnife: "Faca",
  withPistol: "Pistola",
  withScythe: "Foice",
};

/** Ícones dos braços (em `inFight/arms/`). */
export const DRIKA_ARM_ICONS: Record<DrikaArm, string> = {
  withAngelBlades: "blades.svg",
  withKnife: "knife.svg",
  withPistol: "pistol.svg",
  withScythe: "scythe.svg",
};

export function isDrikaArm(value: string): value is DrikaArm {
  return (DRIKA_ARMS as readonly string[]).includes(value);
}

/**
 * Fração da vida **atual** que o Sigilo consome (issue #330: 2%).
 *
 * É vida atual, não máxima, de propósito: a mordida no dedo fica barata quando
 * a Drika já está ferida, então trocar de arma nunca vira a causa da derrota —
 * o `useSigilo` ainda recusa a troca quando o custo zeraria a vida.
 */
export const DRIKA_SIGILO_HP_COST_RATIO = 0.02;

/**
 * Custo em HP de uma troca via Sigilo para a vida atual informada.
 *
 * Arredonda para baixo, mas nunca abaixo de 1: com vida baixa 2% daria zero e a
 * troca sairia de graça, o que tiraria o peso do ritual de sangue.
 */
export function getSigiloHpCost(currentHp: number): number {
  return Math.max(1, Math.floor(currentHp * DRIKA_SIGILO_HP_COST_RATIO));
}
