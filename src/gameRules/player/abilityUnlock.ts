import type { CharacterId } from "@/data/characters/list";
import { CHARACTER_ACTIVE_ABILITIES } from "@/data/characters/abilities";
import {
  ACTIVE_ABILITY_SLOT_UNLOCK_LEVELS,
  DOMAIN_EXPANSION_ABILITY_IDS,
  DOMAIN_EXPANSION_UNLOCK_LEVEL,
} from "@/data/characters/unlockLevels";
import type { ActiveAbility } from "@/utils/types/player/abilities";

/**
 * Regra única de desbloqueio por nível (issue #485). Botão de batalha, atalho
 * de teclado e menu de Status consultam esta função — se cada um decidisse por
 * conta própria, o menu mostraria "liberada" para algo que a battle bloqueia.
 *
 * Precedência:
 * 1. `unlockedAtLevel` declarado no dado vence (escape hatch de balanceamento);
 * 2. Expansão de Domínio → `DOMAIN_EXPANSION_UNLOCK_LEVEL`;
 * 3. habilidade com `requires` (sub-ação de forma/estado, ex.: laser do
 *    Vastolord, Autodestruição do Machine Gama) não ocupa slot: já é gated
 *    pela condição, então libera no nv.1;
 * 4. o resto ocupa slot na ordem do registro (`ACTIVE_ABILITY_SLOT_UNLOCK_LEVELS`).
 *
 * Habilidade fora do registro libera no nv.1: não existe botão para ela, então
 * bloquear só esconderia um erro de dado.
 */
export function getAbilityUnlockLevel(
  characterId: CharacterId,
  abilityId: string,
): number {
  const abilities = CHARACTER_ACTIVE_ABILITIES[characterId] ?? [];
  const ability = abilities.find((a) => a.id === abilityId);
  if (!ability) return 1;
  if (ability.unlockedAtLevel !== undefined) return ability.unlockedAtLevel;
  if (DOMAIN_EXPANSION_ABILITY_IDS.has(ability.id)) {
    return DOMAIN_EXPANSION_UNLOCK_LEVEL;
  }
  if (ability.requires !== undefined) return 1;

  const slotIndex = abilities
    .filter(occupiesSlot)
    .findIndex((a) => a.id === ability.id);
  const lastSlot =
    ACTIVE_ABILITY_SLOT_UNLOCK_LEVELS[
      ACTIVE_ABILITY_SLOT_UNLOCK_LEVELS.length - 1
    ] ?? 1;
  return ACTIVE_ABILITY_SLOT_UNLOCK_LEVELS[slotIndex] ?? lastSlot;
}

/** `true` quando o personagem, no nível dado, já pode usar a habilidade. */
export function isAbilityUnlocked(
  characterId: CharacterId,
  abilityId: string,
  level: number,
): boolean {
  return level >= getAbilityUnlockLevel(characterId, abilityId);
}

function occupiesSlot(ability: ActiveAbility): boolean {
  return (
    ability.unlockedAtLevel === undefined &&
    ability.requires === undefined &&
    !DOMAIN_EXPANSION_ABILITY_IDS.has(ability.id)
  );
}

/**
 * Id da Expansão de Domínio do personagem no registro. O botão de domínio é
 * único na battle, mas o id muda por personagem (`muryokusho`, `hakai`…), e o
 * gate precisa do id real para não cair no "fora do registro = nv.1".
 */
export function getDomainExpansionAbilityId(
  characterId: CharacterId,
): string | undefined {
  return CHARACTER_ACTIVE_ABILITIES[characterId]?.find((ability) =>
    DOMAIN_EXPANSION_ABILITY_IDS.has(ability.id),
  )?.id;
}
