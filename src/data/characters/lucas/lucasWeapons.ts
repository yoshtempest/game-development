/** Armas equipáveis pelo Lucas (Yvel) durante a batalha, por troca aleatória. */
export const LUCAS_WEAPONS = [
  "withDoubleSwords",
  "withSniper",
  "withPistol",
  "withSpear",
  "withKunais",
  "withStaff",
  "withPocketKnife",
] as const;

export type LucasWeapon = (typeof LUCAS_WEAPONS)[number];

/** Arma inicial do Lucas no começo da batalha. */
export const DEFAULT_LUCAS_WEAPON: LucasWeapon = "withDoubleSwords";

/** Alcance de ataque (px) por arma do Lucas — adaptativo conforme a arma equipada. */
export const LUCAS_WEAPON_RANGES: Record<LucasWeapon, number> = {
  withDoubleSwords: 140,
  withSniper: 2000,
  withPistol: 400,
  withSpear: 160,
  withKunais: 300,
  withStaff: 500,
  withPocketKnife: 110,
};

/** Nomes amigáveis das armas do Lucas. */
export const LUCAS_WEAPON_LABELS: Record<LucasWeapon, string> = {
  withDoubleSwords: "Espadas Duplas",
  withSniper: "Sniper",
  withPistol: "Pistola",
  withSpear: "Lança",
  withKunais: "Kunais",
  withStaff: "Cajado",
  withPocketKnife: "Canivete",
};

export function isLucasWeapon(value: string): value is LucasWeapon {
  return (LUCAS_WEAPONS as readonly string[]).includes(value);
}

/** Sorteia uma arma diferente da atual (withBow/arms/withNothing não são armas). */
export function rollNextLucasWeapon(current: LucasWeapon): LucasWeapon {
  const candidates = LUCAS_WEAPONS.filter((w) => w !== current);
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index]!;
}
