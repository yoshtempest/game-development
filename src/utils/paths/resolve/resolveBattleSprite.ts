import { STATE_FOLDER } from "@/data/sprites/sprites";
import { ALL_PREDICATES, stateData } from "@/gameRules/battle/playerStates";
import { ATOMIC_SPRITES } from "@/utils/paths/player/constants";
import { ATTACK_FOLDER_ALT } from "@/utils/paths/player/constants";
import { CHARACTER_STATE_FOLDER_ALT } from "@/utils/paths/player/constants";
import { DOMAIN_EXPANSION_SPRITES } from "@/utils/paths/player/constants";
import { GRAN_REY_CERO_SPRITES } from "@/utils/paths/player/constants";
import { MARCELO_VASTOLORD_SPRITES } from "@/utils/paths/player/constants";
import { RIQUELME_SPHERE_SETUP_SPRITES } from "@/utils/paths/player/constants";
import { playerPath } from "@/utils/paths/player/playerPath";
import { playerPathMarshadowHabilities } from "@/utils/paths/characters/marcelo/playerPathMarshadowHabilities";
import { playerPathArturHabilities } from "@/utils/paths/characters/artur/playerPathArturHabilities";
import { playerPathRiquelmeHabilities } from "@/utils/paths/characters/riquelme/playerPathRiquelmeHabilities";
import type { MarceloBattleForm } from "@/utils/paths/characters/marcelo/types";
import type { LucauaAttackVariant } from "@/utils/types/character/lucaua/lucaua";

export function resolveBattleSprite(
  character: string,
  state: PlayerState,
  weapon?: LucasWeapon,
  form?: MarceloBattleForm,
  lucauaAttackVariant?: LucauaAttackVariant,
): string {
  if (character === "artur" && ALL_PREDICATES.isSpecialTrigger(state)) {
    return playerPathArturHabilities(`/bitesTheDust/arturSeeing.svg`);
  }
  if (state === "mostHonored" && character === "riquelme") {
    return playerPath(`/riquelme/inFight/mostHonored.svg`);
  }
  // Esferas do riquelme (blue/red): a sequência de Setup vive em
  // `inFight/habilities/Setup/` (one/two/three), fora do `STATE_FOLDER`.
  if (character === "riquelme") {
    // A fusão das esferas (purple) tem sprite próprio: `habilities/purple/
    // junction.svg` — não é um dos frames do Setup (one/two/three).
    if (state === "purpleJunction") {
      return playerPathRiquelmeHabilities(`/purple/junction.svg`);
    }
    // Expansão de Domínio (Muryōkūsho): a pose `rioiki.svg` acompanha o domínio
    // inteiro (5s) e não é um frame do Setup.
    if (state === "rioiki") {
      return playerPathRiquelmeHabilities(`/domainExpansion/rioiki.svg`);
    }
    const sphereSprite = stateData(RIQUELME_SPHERE_SETUP_SPRITES, state);
    if (sphereSprite) {
      return playerPathRiquelmeHabilities(`/Setup/${sphereSprite}.svg`);
    }
  }
  // Genki Dama do emanuel: a fase de subida usa o sprite `falling.svg` (não
  // existe `genkiDamaRising.svg`) — o custo fica na pasta de movimento/jump.
  if (state === "genkiDamaRising" && character === "emanuel") {
    return playerPath(`/emanuel/inFight/movement/jump/falling.svg`);
  }
  // Lucaua não tem `blocked.svg`: o bloqueio dele é o overlay `shield.svg`
  // (renderizado pelo `PlayerBattle`). O corpo fica parado no idle enquanto o
  // shield cobre o lado atacado — sem isso a imagem cairia em 404.
  if (state === "blocked" && character === "lucaua") {
    return playerPath(`/lucaua/inFight/idle/idle.svg`);
  }
  // Habilidades do marcelo: os sprites da sequência ficam em pastas próprias
  // (`habilities/atomic/`, `habilities/domainExpansion/`,
  // `habilities/granReyCero/`) — não existe `default/preparingAtomic.svg` nem
  // `default/preMugetsu.svg`.
  if (character === "marcelo") {
    const atomicSprite = stateData(ATOMIC_SPRITES, state);
    if (atomicSprite) {
      return playerPathMarshadowHabilities(`/atomic/${atomicSprite}.svg`);
    }
    const domainSprite = stateData(DOMAIN_EXPANSION_SPRITES, state);
    if (domainSprite) {
      return playerPathMarshadowHabilities(
        `/domainExpansion/${domainSprite}.svg`,
      );
    }
    const granReyCeroSprite = stateData(GRAN_REY_CERO_SPRITES, state);
    if (granReyCeroSprite) {
      return playerPathMarshadowHabilities(
        `/granReyCero/${granReyCeroSprite}.svg`,
      );
    }
  }
  // Forma Vastolord do marcelo: a partir da transformação, TODOS os sprites
  // vêm da pasta `vastolordForm/` — nenhum estado volta ao `default/`.
  if (character === "marcelo" && form === "vastolordForm") {
    const sprite = stateData(MARCELO_VASTOLORD_SPRITES, state) ?? "idle/idle";
    return playerPath(`/marcelo/inFight/vastolordForm/${sprite}.svg`);
  }
  const folder = stateData(STATE_FOLDER, state);
  if (folder === null) {
    if (character === "lucas" && weapon) {
      return playerPath(`/${character}/inFight/${weapon}/${state}.svg`);
    }
    if (character === "marcelo") {
      return playerPath(`/${character}/inFight/default/${state}.svg`);
    }
    return playerPath(`/${character}/inFight/${state}.svg`);
  }
  // O emanuel aninha TODO o movimento em `inFight/movement/` (idle/jump/run
  // não ficam na raiz do inFight como no riquelme/marcelo). O override por
  // character + estado resolve isso (ex.: idle → movement/idle).
  const resolved =
    stateData(CHARACTER_STATE_FOLDER_ALT[character], state) ??
    (folder === "attack" && ATTACK_FOLDER_ALT.has(character)
      ? "attacks"
      : folder);
  // Lucaua: o básico é um disparo de energia — os golpes não têm `attack.svg`,
  // e sim as poses de mão (`leftHandAttack`/`rightHandAttack`, alternadas a
  // cada golpe, e `bothSidesAttack` quando há inimigos dos dois lados). A
  // variante chega da batalha; consumidores fora dela (menu de Status, combo,
  // replay) caem no `rightHandAttack`.
  if (character === "lucaua" && folder === "attack") {
    const variant = lucauaAttackVariant ?? "right";
    const file =
      variant === "left"
        ? "leftHandAttack"
        : variant === "both"
          ? "bothSidesAttack"
          : "rightHandAttack";
    return playerPath(`/lucaua/inFight/attacks/${file}.svg`);
  }
  if (character === "lucas" && weapon) {
    return playerPath(
      `/${character}/inFight/${weapon}/${resolved}/${state}.svg`,
    );
  }
  if (character === "marcelo") {
    return playerPath(`/${character}/inFight/default/${resolved}/${state}.svg`);
  }
  return playerPath(`/${character}/inFight/${resolved}/${state}.svg`);
}
