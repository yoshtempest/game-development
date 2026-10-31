import type { CharacterId } from "@/data/characters/list";
import { getCharacterPassives } from "@/data/characters/passives";
import type {
  ActiveAbility,
  CharacterAbility,
  PassiveAbility,
  AbilityCameraFocus,
} from "@/utils/types/player/abilities";
import type { DamageKind } from "@/utils/types/battle/damageKind";

import { SR_GUAXINIM_ACTIVE_ABILITIES } from "./srGuaxinim/abilities";
import { LARICELL_ACTIVE_ABILITIES } from "./laricell/abilities";
import { NATSUKI_ACTIVE_ABILITIES } from "./natsuki/abilities";
import { YVEL_ACTIVE_ABILITIES } from "./yvel/abilities";
import { BABIDI_ACTIVE_ABILITIES } from "./babidi/abilities";
import { EMATRON_ACTIVE_ABILITIES } from "./ematron/abilities";
import { MARSHADOW_ACTIVE_ABILITIES } from "./marshadow/abilities";
import { DRIKA_ACTIVE_ABILITIES } from "./drika/abilities";
import { SAMUEL_ACTIVE_ABILITIES } from "./samurion/abilities";
import { YRA_ACTIVE_ABILITIES } from "./yra/abilities";
import { CAMYKAZE_ACTIVE_ABILITIES } from "./camyKaze/abilities";
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
  srGuaxinim: SR_GUAXINIM_ACTIVE_ABILITIES,
  laricell: LARICELL_ACTIVE_ABILITIES,
  natsuki: NATSUKI_ACTIVE_ABILITIES,
  yvel: YVEL_ACTIVE_ABILITIES,
  babidi: BABIDI_ACTIVE_ABILITIES,
  ematron: EMATRON_ACTIVE_ABILITIES,
  marshadow: MARSHADOW_ACTIVE_ABILITIES,
  drika: DRIKA_ACTIVE_ABILITIES,
  samurion: SAMUEL_ACTIVE_ABILITIES,
  yra: YRA_ACTIVE_ABILITIES,
  camyKaze: CAMYKAZE_ACTIVE_ABILITIES,
  levi: LEVI_ACTIVE_ABILITIES,
};

/**
 * Busca uma habilidade ativa pelo par personagem + id.
 *
 * O par é obrigatório porque `domainBurst` existe em vários personagens com
 * nome/descrição diferentes — um índice global por id escolheria o último e
 * mostraria o domínio de outro personagem no botão.
 */
export function getActiveAbility(
  characterId: CharacterId,
  abilityId: string,
): ActiveAbility | undefined {
  return CHARACTER_ACTIVE_ABILITIES[characterId]?.find(
    (ability) => ability.id === abilityId,
  );
}

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

// ── Foco de câmera por habilidade ─────────────────────────────────────────────

/**
 * Busca a spec de foco de câmera de uma habilidade ativa, ou `null` quando a
 * habilidade não move a câmera.
 */
export function getAbilityCameraFocus(
  characterId: CharacterId,
  abilityId: string,
): AbilityCameraFocus | null {
  const ability = getActiveAbility(characterId, abilityId);
  return ability?.cameraFocus ?? null;
}

/** Detecta se a habilidade aplicará foco de câmera em alguma entidade. */
export function willApplyAbilityCameraFocus(
  characterId: CharacterId,
  abilityId: string,
): boolean {
  return getAbilityCameraFocus(characterId, abilityId) !== null;
}

/** Quanto será o foco (zoom) aplicado; `null` quando não houver foco. */
export function getAbilityCameraFocusAmount(
  characterId: CharacterId,
  abilityId: string,
): number | null {
  return getAbilityCameraFocus(characterId, abilityId)?.zoom ?? null;
}

/** Qual entidade receberá o foco; `null` quando não houver foco. */
export function getAbilityCameraFocusEntity(
  characterId: CharacterId,
  abilityId: string,
): "player" | "npc" | null {
  return getAbilityCameraFocus(characterId, abilityId)?.entity ?? null;
}
