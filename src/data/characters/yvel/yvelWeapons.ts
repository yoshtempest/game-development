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

/**
 * Duração (ms de batalha, sem contar a pausa do arsenal) da janela do
 * Unlimited Blade Works. Enquanto ela dura, o botão de troca abre o seletor
 * em vez de sortear.
 *
 * Decisão para revisar: a issue #219 não fixa a duração; 15s dá tempo de
 * trocar algumas vezes sem virar o kit permanente do personagem.
 */
export const UNLIMITED_BLADE_WORKS_DURATION_MS = 15000;

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
