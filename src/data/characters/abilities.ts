import type { CharacterId } from "@/data/characters/list";
import { getCharacterPassives } from "@/data/characters/passives";
import type {
  ActiveAbility,
  CharacterAbility,
  PassiveAbility,
} from "@/utils/types/player/abilities";
import type { DamageKind } from "@/utils/types/battle/damageKind";

import { ARTUR_ACTIVE_ABILITIES } from "./artur/abilities";
import { LARISSA_ACTIVE_ABILITIES } from "./larissa/abilities";
import { RIQUELME_ACTIVE_ABILITIES } from "./riquelme/abilities";
import { LUCAS_ACTIVE_ABILITIES } from "./lucas/abilities";
import { LUCAUA_ACTIVE_ABILITIES } from "./lucaua/abilities";
import { EMANUEL_ACTIVE_ABILITIES } from "./emanuel/abilities";
import { MARCELO_ACTIVE_ABILITIES } from "./marcelo/abilities";
import { EDUARDA_ACTIVE_ABILITIES } from "./eduarda/abilities";
import { SAMUEL_ACTIVE_ABILITIES } from "./samuel/abilities";
import { MAYRA_ACTIVE_ABILITIES } from "./mayra/abilities";
import { CAMILLY_ACTIVE_ABILITIES } from "./camilly/abilities";
import { LEVI_ACTIVE_ABILITIES } from "./levi/abilities";

/**
 * Habilidades ativas por personagem — as que viram botão na tela de batalha.
 *
 * É `Partial` de propósito: personagem sem habilidade ativa é caso legítimo
 * (não tem por que existir uma linha `[]` para cada um dos 12 personagens).
 * Cada personagem declara as suas em `<personagem>/abilities.ts`; este arquivo
 * é só o ponto de agregação que a battle e o menu de Status consultam.
 */
export const CHARACTER_ACTIVE_ABILITIES: Partial<
  Record<CharacterId, ActiveAbility[]>
> = {
  artur: ARTUR_ACTIVE_ABILITIES,
  larissa: LARISSA_ACTIVE_ABILITIES,
  riquelme: RIQUELME_ACTIVE_ABILITIES,
  lucas: LUCAS_ACTIVE_ABILITIES,
  lucaua: LUCAUA_ACTIVE_ABILITIES,
  emanuel: EMANUEL_ACTIVE_ABILITIES,
  marcelo: MARCELO_ACTIVE_ABILITIES,
  eduarda: EDUARDA_ACTIVE_ABILITIES,
  samuel: SAMUEL_ACTIVE_ABILITIES,
  mayra: MAYRA_ACTIVE_ABILITIES,
  camilly: CAMILLY_ACTIVE_ABILITIES,
  levi: LEVI_ACTIVE_ABILITIES,
};

function toPassiveAbility(
  passive: ReturnType<typeof getCharacterPassives>[number],
): PassiveAbility {
  return {
    kind: "passive",
    id: passive.id,
    name: passive.name,
    description: passive.description,
    unlockedAtLevel: passive.unlockedAtLevel,
    oncePerBattle: passive.oncePerBattle,
  };
}

/**
 * Lista de habilidades de um personagem: ativas do registro acima + passivas
 * de `CHARACTER_PASSIVES`.
 *
 * Passivas `notImplemented` são omitidas de propósito — é assim que um
 * personagem fica legitimamente sem nenhuma habilidade em vez de exibindo um
 * card "Passiva (a definir)".
 */
export function getCharacterAbilities(
  characterId: CharacterId,
): CharacterAbility[] {
  const passives = getCharacterPassives(characterId)
    .filter((passive) => passive.effect.kind !== "notImplemented")
    .map(toPassiveAbility);

  return [...passives, ...(CHARACTER_ACTIVE_ABILITIES[characterId] ?? [])];
}

/**
 * Índice `abilityId -> natureza do dano`, achatado a partir do registro acima.
 *
 * Existe para os hooks de habilidade lerem a mesma verdade que o menu de Status
 * exibe: um golpe que "deveria" ser mágico e sai físico é bug de dado, não de
 * hook. Ausente no índice = físico, o caso do ataque básico.
 */
const ABILITY_DAMAGE_TYPES: Record<string, DamageKind> = Object.fromEntries(
  Object.values(CHARACTER_ACTIVE_ABILITIES).flatMap((abilities) =>
    (abilities ?? [])
      .filter((ability) => ability.damageType !== undefined)
      .map((ability) => [ability.id, ability.damageType as DamageKind]),
  ),
);

export function getAbilityDamageType(abilityId: string): DamageKind {
  return ABILITY_DAMAGE_TYPES[abilityId] ?? "physical";
}
