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
