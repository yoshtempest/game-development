/** Armas equipáveis pelo Yvel (Yvel) durante a batalha, por troca aleatória. */
export const YVEL_WEAPONS = [
  "withDoubleSwords",
  "withSniper",
  "withPistol",
  "withSpear",
  "withKunais",
  "withStaff",
  "withPocketKnife",
] as const;

export type YvelWeapon = (typeof YVEL_WEAPONS)[number];

/** Arma inicial do Yvel no começo da batalha. */
export const DEFAULT_YVEL_WEAPON: YvelWeapon = "withDoubleSwords";

/** Alcance de ataque (px) por arma do Yvel — adaptativo conforme a arma equipada. */
export const YVEL_WEAPON_RANGES: Record<YvelWeapon, number> = {
  withDoubleSwords: 140,
  withSniper: 2000,
  withPistol: 400,
  withSpear: 160,
  withKunais: 300,
  withStaff: 500,
  withPocketKnife: 110,
};

/** Nomes amigáveis das armas do Yvel. */
export const YVEL_WEAPON_LABELS: Record<YvelWeapon, string> = {
  withDoubleSwords: "Espadas Duplas",
  withSniper: "Sniper",
  withPistol: "Pistola",
  withSpear: "Lança",
  withKunais: "Kunais",
  withStaff: "Cajado",
  withPocketKnife: "Canivete",
};

export function isYvelWeapon(value: string): value is YvelWeapon {
  return (YVEL_WEAPONS as readonly string[]).includes(value);
}

/** Sorteia uma arma diferente da atual (withBow/arms/withNothing não são armas). */
export function rollNextYvelWeapon(current: YvelWeapon): YvelWeapon {
  const candidates = YVEL_WEAPONS.filter((w) => w !== current);
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index]!;
}
