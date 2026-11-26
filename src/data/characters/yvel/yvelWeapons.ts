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

/**
 * Teto (ms) do congelamento do mundo enquanto o yvel carrega o ataque
 * (issue #217). Segurar o botão indefinidamente não pode virar pausa
 * infinita: passado o teto, o mundo volta a andar mesmo com a carga presa.
 *
 * Decisão para revisar: a issue não fala de limite; 8s cobre o `CHARGE_TIME`
 * com folga para o jogador mirar.
 */
export const YVEL_CHARGE_FREEZE_MAX_MS = 8000;

/** Id do efeito de time do congelamento da carga (upsert/clear por id). */
export const YVEL_CHARGE_FREEZE_TIME_ID = "yvel:chargeFreeze";

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

/**
 * Arma "útil para a situação" forjada ao soltar o ataque carregado (issue
 * #217): sorteia entre as armas cujo alcance cobre a distância até o inimigo,
 * para a próxima troca de golpes já acertar de onde o yvel está. Se nenhuma
 * alcança, a de maior alcance é a única útil.
 *
 * Exclui a arma atual quando há outra candidata — forjar a mesma arma
 * pareceria que o ataque não fez nada.
 *
 * @param distance - Distância (px) do yvel até o inimigo principal.
 * @param current - Arma equipada agora.
 * @param random - Fonte de aleatoriedade em [0, 1) (injetável para teste).
 */
export function pickUsefulYvelWeapon(
  distance: number,
  current: YvelWeapon,
  random: () => number = Math.random,
): YvelWeapon {
  const reaching = YVEL_WEAPONS.filter(
    (w) => YVEL_WEAPON_RANGES[w] >= distance,
  );
  if (reaching.length === 0) {
    return YVEL_WEAPONS.reduce((best, w) =>
      YVEL_WEAPON_RANGES[w] > YVEL_WEAPON_RANGES[best] ? w : best,
    );
  }
  const others = reaching.filter((w) => w !== current);
  const pool = others.length > 0 ? others : reaching;
  return pool[Math.floor(random() * pool.length)] ?? current;
}
