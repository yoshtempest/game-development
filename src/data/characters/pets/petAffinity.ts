/**
 * Afinidade pet ↔ jogador (issues #418 e #74). Vai de 5 estrelas de ódio
 * (`-5`) a 5 de afeição (`+5`); todo pet começa neutro (`0`).
 */
export const PET_AFFINITY_MIN = -5;
export const PET_AFFINITY_MAX = 5;
export const PET_AFFINITY_DEFAULT = 0;

/**
 * Quanto um carinho rende e quantos por dia cada pet aceita. O limite diário
 * existe para a afinidade não virar clique infinito no menu — decisão para
 * revisar.
 */
export const PET_AFFINITY_PETTING_GAIN = 1;
export const PET_AFFINITY_PETTINGS_PER_DAY = 1;

/**
 * Vitórias com o pet equipado necessárias para +1 de afinidade ("quanto mais
 * luta com o pet, maior a favorabilidade") — decisão para revisar.
 */
export const PET_AFFINITY_WINS_PER_STAR = 5;

/**
 * Bônus/penalidade por estrela aplicado ao que o pet faz em batalha (dano,
 * cura, escudo, invocação). Assimétrico de propósito: no máximo de afeição o
 * pet chega a dobrar (#74: "pode até dobrar"), mas o ódio máximo só corta pela
 * metade, para não anular o pet — decisão para revisar.
 */
export const PET_AFFINITY_BONUS_PER_STAR = 0.2;
export const PET_AFFINITY_PENALTY_PER_STAR = 0.1;

export type PetAffinityEntry = {
  value: number;
  /** Data local (`YYYY-MM-DD`) do último carinho, base do limite diário. */
  lastPettingDate: string | null;
  pettingsToday: number;
  /** Vitórias acumuladas desde a última estrela ganha em batalha. */
  battleWins: number;
};

export type PetsAffinity = Record<string, PetAffinityEntry>;

export const PET_AFFINITY_DEFAULT_ENTRY: PetAffinityEntry = {
  value: PET_AFFINITY_DEFAULT,
  lastPettingDate: null,
  pettingsToday: 0,
  battleWins: 0,
};

function finiteInt(raw: unknown, fallback: number): number {
  return typeof raw === "number" && Number.isFinite(raw)
    ? Math.trunc(raw)
    : fallback;
}

/**
 * Saneia o que veio do storage: save antigo não tem a chave e save editado à
 * mão pode trazer valor fora da faixa, então tudo é limitado aqui uma vez.
 */
export function normalizePetAffinity(data: unknown): PetsAffinity {
  const safe: PetsAffinity = {};
  if (!data || typeof data !== "object") return safe;

  for (const [petId, raw] of Object.entries(data as Record<string, unknown>)) {
    if (!raw || typeof raw !== "object") continue;
    const entry = raw as Record<string, unknown>;
    safe[petId] = {
      value: Math.min(
        PET_AFFINITY_MAX,
        Math.max(
          PET_AFFINITY_MIN,
          finiteInt(entry.value, PET_AFFINITY_DEFAULT),
        ),
      ),
      lastPettingDate:
        typeof entry.lastPettingDate === "string"
          ? entry.lastPettingDate
          : null,
      pettingsToday: Math.max(0, finiteInt(entry.pettingsToday, 0)),
      battleWins: Math.max(0, finiteInt(entry.battleWins, 0)),
    };
  }
  return safe;
}
