import {
  PET_AFFINITY_BONUS_PER_STAR,
  PET_AFFINITY_MAX,
  PET_AFFINITY_MIN,
  PET_AFFINITY_PENALTY_PER_STAR,
  PET_AFFINITY_PETTINGS_PER_DAY,
  PET_AFFINITY_PETTING_GAIN,
  PET_AFFINITY_WINS_PER_STAR,
  type PetAffinityEntry,
} from "@/data/characters/pets/petAffinity";

export function clampPetAffinity(value: number): number {
  return Math.min(PET_AFFINITY_MAX, Math.max(PET_AFFINITY_MIN, value));
}

/**
 * Multiplicador aplicado a tudo que o pet faz em batalha. Afeição soma
 * `PET_AFFINITY_BONUS_PER_STAR` por estrela (até ×2), ódio tira
 * `PET_AFFINITY_PENALTY_PER_STAR` (até ×0,5).
 */
export function getPetAffinityMultiplier(affinity: number): number {
  const value = clampPetAffinity(affinity);
  return value >= 0
    ? 1 + value * PET_AFFINITY_BONUS_PER_STAR
    : 1 + value * PET_AFFINITY_PENALTY_PER_STAR;
}

/** Data local `YYYY-MM-DD`: o limite diário vira à meia-noite do jogador. */
export function getLocalDateKey(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export type PettingResult =
  { ok: true; entry: PetAffinityEntry } | { ok: false; reason: "dailyLimit" };

/**
 * Aplica um carinho. Recusa quando o pet já recebeu o limite do dia; o
 * contador zera sozinho quando a data muda, sem precisar de job à meia-noite.
 */
export function applyPetting(
  entry: PetAffinityEntry,
  today: string,
): PettingResult {
  const pettingsToday =
    entry.lastPettingDate === today ? entry.pettingsToday : 0;
  if (pettingsToday >= PET_AFFINITY_PETTINGS_PER_DAY) {
    return { ok: false, reason: "dailyLimit" };
  }
  return {
    ok: true,
    entry: {
      ...entry,
      value: clampPetAffinity(entry.value + PET_AFFINITY_PETTING_GAIN),
      lastPettingDate: today,
      pettingsToday: pettingsToday + 1,
    },
  };
}

/**
 * Registra uma vitória com o pet equipado: a cada
 * `PET_AFFINITY_WINS_PER_STAR` vitórias ganha +1 de afinidade.
 */
export function applyBattleWin(entry: PetAffinityEntry): PetAffinityEntry {
  const wins = entry.battleWins + 1;
  if (wins < PET_AFFINITY_WINS_PER_STAR) return { ...entry, battleWins: wins };
  return {
    ...entry,
    value: clampPetAffinity(entry.value + 1),
    battleWins: 0,
  };
}
