export type PetProgress = {
  level: number;
  xp: number;
};

export type PetsProgress = Record<string, Record<number, PetProgress>>;

export const PET_DEFAULT_PROGRESS: PetProgress = {
  level: 1,
  xp: 0,
};

export const PET_STAR_MAX = 5;
export const PET_STAR_MULTIPLIER = 1.5;

export const PET_CLASS: Record<string, NPCClass> = {
  pet_goat: "common",
  pet_cat: "rare",
  pet_dog: "epic",
  pet_leviathan: "legendary",
  pet_hungryDeath: "common",
  pet_piupiu: "rare",
  pet_hungryKing: "epic",
  pet_madame: "epic",
  pet_mosquito: "epic",
  pet_turkey: "rare",
  pet_crocodile: "rare",
  pet_zecaUrubu: "rare",
  pet_duque: "rare",
};

export const PET_XP_MULTIPLIER = 0.7;
export const PET_MAX_LEVEL = 100;

export function petStarsFromEnhance(enhance: number): number {
  const stars = Math.floor(enhance) + 1;
  return Math.min(Math.max(stars, 1), PET_STAR_MAX);
}

export function enhanceFromPetStars(stars: number): number {
  const clamped = Math.min(Math.max(Math.floor(stars), 1), PET_STAR_MAX);
  return clamped - 1;
}

export const PET_BASE_DAMAGE = 8;
export const PET_DAMAGE_PER_LEVEL = 1;

export function getPetBaseDamage(level: number, stars: number = 1): number {
  const base = PET_BASE_DAMAGE + (level - 1) * PET_DAMAGE_PER_LEVEL;
  return Math.round(base * PET_STAR_MULTIPLIER ** (stars - 1));
}

function clampProgress(raw: unknown): PetProgress | null {
  if (!raw || typeof raw !== "object") return null;
  const saved = raw as Record<string, unknown>;
  const level =
    typeof saved.level === "number" && !Number.isNaN(saved.level)
      ? Math.min(saved.level, PET_MAX_LEVEL)
      : null;
  if (level === null) return null;
  const xp =
    typeof saved.xp === "number" && !Number.isNaN(saved.xp) ? saved.xp : 0;
  return { level, xp };
}

export function normalizePetProgress(data: unknown): PetsProgress {
  const safe: PetsProgress = {};
  const raw = data as Record<string, unknown> | undefined;

  for (const petId of Object.keys(PET_CLASS)) {
    const saved = raw?.[petId];
    const byStar: Record<number, PetProgress> = {};

    if (saved && typeof saved === "object") {
      if ("level" in saved) {
        const progress = clampProgress(saved);
        if (progress) byStar[1] = progress;
      } else {
        const starData = saved as Record<string, unknown>;
        for (let stars = 1; stars <= PET_STAR_MAX; stars++) {
          const progress = clampProgress(starData[String(stars)]);
          if (progress) byStar[stars] = progress;
        }
      }
    }

    safe[petId] = byStar;
  }

  return safe;
}
