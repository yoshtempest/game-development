import { FIVE_THOUSAND_MS } from "@/data/ms";
import type { PetRole } from "./types";

export const PET_SKILL_COOLDOWN_MS = FIVE_THOUSAND_MS;

export const PET_ROOT_DURATION_MS = 1000;

export const PET_ROLE_LABELS: Record<PetRole, string> = {
  montaria: "Montaria",
  suporte: "Suporte",
  dano: "Dano",
  tanker: "Tanker",
};
