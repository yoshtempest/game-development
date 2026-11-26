import type { CharacterId } from "@/data/characters/list";
import { SAMURION_BERSERK_MIN_LEVEL } from "@/data/characters/unlockLevels";

/**
 * A fúria do Samurion depende do nível; os três funis de dano (golpe, summon,
 * dash) perguntam aqui para não repetirem o literal. Fica fora de
 * `abilityUnlock.ts` de propósito: aquele arquivo carrega o registro de
 * habilidades inteiro, e o funil de dano não deve depender dele.
 */
export function isSamurionBerserkActive(
  characterId: CharacterId,
  level: number,
): boolean {
  return characterId === "samurion" && level >= SAMURION_BERSERK_MIN_LEVEL;
}
