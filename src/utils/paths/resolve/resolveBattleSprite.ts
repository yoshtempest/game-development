import { STATE_FOLDER } from "@/data/sprites/sprites";
import { ALL_PREDICATES, stateData } from "@/gameRules/battle/playerStates";
import { ATOMIC_SPRITES } from "@/utils/paths/player/constants";
import { ATTACK_FOLDER_ALT } from "@/utils/paths/player/constants";
import { CHARACTER_STATE_FOLDER_ALT } from "@/utils/paths/player/constants";
import { DOMAIN_EXPANSION_SPRITES } from "@/utils/paths/player/constants";
import { GRAN_REY_CERO_SPRITES } from "@/utils/paths/player/constants";
import {
  EMATRON_HABILITIES_SPRITES,
  EMATRON_ATTACK_SPRITES,
} from "@/utils/paths/player/constants";
import { MARSHADOW_VASTOLORD_SPRITES } from "@/utils/paths/player/constants";
import { NATSUKI_SPHERE_SETUP_SPRITES } from "@/utils/paths/player/constants";
import { playerPath } from "@/utils/paths/player/playerPath";
import {
  playerPathMarshadowHabilities,
  playerPathSrGuaxinimHabilities,
  playerPathNatsukiHabilities,
  playerPathEmatronHabilities
} from "@/utils/paths/index";
import type { MarshadowBattleForm } from "@/utils/paths/characters/marshadow/types";
import type { BabidiAttackVariant } from "@/utils/types/character/babidi/attack";
import { getBabidiAttackMode } from "@/utils/character/babidiAttackMode";

export function resolveBattleSprite(
  character: string,
  state: PlayerState,
  weapon?: YvelWeapon,
  form?: MarshadowBattleForm,
  babidiAttackVariant?: BabidiAttackVariant,
): string {
  if (character === "babidi" && (state === "preAbility" || state === "ability")) {
    return playerPath("/babidi/inFight/habilities/fishingNet/pointing.svg");
  }
  if (character === "srGuaxinim" && ALL_PREDICATES.isAbilityTrigger(state)) {
    return playerPathSrGuaxinimHabilities(`/bitesTheDust/srGuaxinimSeeing.svg`);
  }
  if (state === "mostHonored" && character === "natsuki") {
    return playerPath(`/natsuki/inFight/mostHonored.svg`);
  }
  // Esferas do natsuki (blue/red): a sequência de Setup vive em
  // `inFight/habilities/Setup/` (one/two/three), fora do `STATE_FOLDER`.
  if (character === "natsuki") {
    // A fusão das esferas (purple) tem sprite próprio: `habilities/purple/
    // junction.svg` — não é um dos frames do Setup (one/two/three).
    if (state === "purpleJunction") {
      return playerPathNatsukiHabilities(`/purple/junction.svg`);
    }
    // Expansão de Domínio (Muryōkūsho): a pose `rioiki.svg` acompanha o domínio
    // inteiro (5s) e não é um frame do Setup.
    if (state === "rioiki") {
      return playerPathNatsukiHabilities(`/domainExpansion/rioiki.svg`);
    }
    const sphereSprite = stateData(NATSUKI_SPHERE_SETUP_SPRITES, state);
    if (sphereSprite) {
      return playerPathNatsukiHabilities(`/Setup/${sphereSprite}.svg`);
    }
  }
  // Genki Dama do ematron: a fase de subida usa o sprite `falling.svg` (não
  // existe `genkiDamaRising.svg`). O sprite está em `inFight/jump/`, não
  // em `inFight/movement/jump/`.
  if (state === "genkiDamaRising" && character === "ematron") {
    return playerPath(`/ematron/inFight/jump/falling.svg`);
  }
  // Habilidades do ematron: os sprites ficam em `inFight/habilities/<ability>/`.
  if (character === "ematron") {
    const abilitySprite = stateData(EMATRON_HABILITIES_SPRITES, state);

    if (abilitySprite) {
      return playerPathEmatronHabilities(`/${abilitySprite}.svg`);
    }

    const attackSprite = stateData(EMATRON_ATTACK_SPRITES, state);

    if (attackSprite) {
      return playerPath(`/ematron/inFight/attacks/${attackSprite}.svg`);
    }
  }
  // Babidi não tem `blocked.svg`: o bloqueio dele é o overlay `shield.svg`
  // (renderizado pelo `PlayerBattle`). O corpo fica parado no idle enquanto o
  // shield cobre o lado atacado — sem isso a imagem cairia em 404.
  if (state === "blocked" && character === "babidi") {
    return playerPath(
      `/babidi/inFight/${getBabidiAttackMode()}/idle/idle.svg`,
    );
  }
  // Habilidades do marshadow: os sprites da sequência ficam em pastas próprias
  // (`habilities/atomic/`, `habilities/domainExpansion/`,
  // `habilities/granReyCero/`) — não existe `default/preparingAtomic.svg` nem
  // `default/preMugetsu.svg`.
  if (character === "marshadow") {
    const spriteMappings = [
      {
        sprites: ATOMIC_SPRITES,
        folder: "atomic",
      },
      {
        sprites: DOMAIN_EXPANSION_SPRITES,
        folder: "domainExpansion",
      },
      {
        sprites: GRAN_REY_CERO_SPRITES,
        folder: "granReyCero",
      },
    ] as const;

    for (const { sprites, folder } of spriteMappings) {
      const sprite = stateData(sprites, state);

      if (sprite) {
        return playerPathMarshadowHabilities(`/${folder}/${sprite}.svg`);
      }
    }
  }
  // Forma Vastolord do marshadow: a partir da transformação, TODOS os sprites
  // vêm da pasta `vastolordForm/` — nenhum estado volta ao `default/`.
  if (character === "marshadow" && form === "vastolordForm") {
    const sprite = stateData(MARSHADOW_VASTOLORD_SPRITES, state) ?? "idle/idle";
    return playerPath(`/marshadow/inFight/vastolordForm/${sprite}.svg`);
  }
  // Habilidade ativa (Killer Queen/Explosão de Stacks): não há pasta `special`
  // para nenhum personagem. O srGuaxinim já saiu acima com a pose do Bites the Dust;
  // quem não tiver sprite dedicado de habilidade cai no golpe básico.
  if (ALL_PREDICATES.isAbilityTrigger(state)) {
    return resolveBattleSprite(
      character,
      "attack",
      weapon,
      form,
      babidiAttackVariant,
    );
  }
  const folder = stateData(STATE_FOLDER, state);
  if (folder === null) {
    if (character === "yvel" && weapon) {
      return playerPath(`/${character}/inFight/${weapon}/${state}.svg`);
    }
    if (character === "marshadow") {
      return playerPath(`/${character}/inFight/default/${state}.svg`);
    }
    if (character === "babidi") {
      return playerPath(
        `/babidi/inFight/${getBabidiAttackMode()}/${state}.svg`,
      );
    }
    return playerPath(`/${character}/inFight/${state}.svg`);
  }
  // O ematron aninha TODO o movimento em `inFight/movement/` (idle/jump/run
  // não ficam na raiz do inFight como no natsuki/marshadow). O override por
  // character + estado resolve isso (ex.: idle → movement/idle).
  const resolved =
    stateData(CHARACTER_STATE_FOLDER_ALT[character], state) ??
    (folder === "attack" && ATTACK_FOLDER_ALT.has(character)
      ? "attacks"
      : folder);
  // Babidi: o básico tem dois modos selecionáveis pelo jogador (withGun /
  // withMissile). No modo withGun usa as poses de mão; no modo withMissile
  // usa a animação padrão preAttack -> attack da pasta withMissile.
  if (character === "babidi" && folder === "attack") {
    if (getBabidiAttackMode() === "withMissile") {
      const file = state === "attack" ? "attack" : "preAttack";
      return playerPath(`/babidi/inFight/withMissile/attacks/${file}.svg`);
    }
    const variant = babidiAttackVariant ?? "right";
    const file =
      variant === "left"
        ? "leftHandAttack"
        : variant === "both"
          ? "bothSidesAttack"
          : "rightHandAttack";
    return playerPath(`/babidi/inFight/withGun/attacks/${file}.svg`);
  }
  if (character === "yvel" && weapon) {
    return playerPath(
      `/${character}/inFight/${weapon}/${resolved}/${state}.svg`,
    );
  }
  if (character === "marshadow") {
    return playerPath(`/${character}/inFight/default/${resolved}/${state}.svg`);
  }
  if (character === "babidi") {
    return playerPath(
      `/babidi/inFight/${getBabidiAttackMode()}/${resolved}/${state}.svg`,
    );
  }
  return playerPath(`/${character}/inFight/${resolved}/${state}.svg`);
}
