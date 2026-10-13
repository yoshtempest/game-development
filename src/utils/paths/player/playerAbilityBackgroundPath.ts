import { asset } from "@/utils/paths/asset";
import type { MarceloBattleForm } from "@/utils/paths/characters/marcelo/types";

/**
 * Personagens cujas habilidades vivem **direto** em `inFight/habilities/`
 * (sem a pasta de forma): o artur (Killer Queen em `habilities/bitesTheDust/`)
 * e o riquelme (esferas em `habilities/blue|red/` e a sequência em
 * `habilities/Setup/`). O marcelo, por outro lado, aninha tudo sob a forma
 * (`inFight/default/habilities/` e `inFight/vastolordForm/habilities/`).
 */
const FLAT_ABILITY_FOLDER = new Set(["artur", "riquelme"]);

/**
 * Arte (`file`) de uma habilidade de personagem:
 * `inFight/<forma>/habilities/<ability>/<file>` (ou
 * `inFight/habilities/<ability>/<file>` para quem não tem forma).
 *
 * A forma entra no caminho porque as habilidades não vivem todas na pasta
 * `default/` — as liberadas na Forma Vastolord do marcelo (o laser) ficam em
 * `vastolordForm/`, igual aos sprites (veja `resolveBattleSprite`). O
 * `background.svg` é a intro (`SpecialIntro`); o `expansion.svg` é o
 * preenchimento do domínio (`DomainExpansionBackground`).
 */
export function playerAbilityPath(
  character: string,
  ability: string,
  file: string,
  form: MarceloBattleForm = "default",
) {
  const folder = FLAT_ABILITY_FOLDER.has(character)
    ? "habilities"
    : `${form}/habilities`;
  return asset(
    `/assets/player/${character}/inFight/${folder}/${ability}/${file}`,
  );
}

/**
 * Background de abertura (`SpecialIntro`) de uma habilidade de personagem:
 * `inFight/<forma>/habilities/<ability>/background.svg` (ou
 * `inFight/habilities/<ability>/background.svg` para quem não tem forma).
 */
export function playerAbilityBackgroundPath(
  character: string,
  ability: string,
  form: MarceloBattleForm = "default",
) {
  return playerAbilityPath(character, ability, "background.svg", form);
}
