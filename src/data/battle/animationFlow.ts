// PlayerState vem do escopo global (src/utils/types/global.d.ts) — fonte única.
import { EMATRON_AIR_GRAB_DURATION_MS } from "@/data/characters/ematron";
import {
  ONE_HUNDRED_MS,
  ONE_HUNDRED_FIFTY_MS,
  TWO_HUNDRED_MS,
  THREE_HUNDRED_MS,
  FOUR_HUNDRED_MS,
  FIVE_HUNDRED_MS,
  EIGHT_HUNDRED_MS,
} from "@/data/ms";

type AnimationStep = {
  next: PlayerState;
  duration: number; // ms
};

export const animationFlow: Record<PlayerState, AnimationStep | null> = {
  idle: null,

  crit: { next: "idle", duration: THREE_HUNDRED_MS },

  preAttack: { next: "attack", duration: ONE_HUNDRED_FIFTY_MS },
  attack: { next: "idle", duration: THREE_HUNDRED_MS },
  preKick: { next: "kick", duration: ONE_HUNDRED_MS },
  kick: { next: "idle", duration: THREE_HUNDRED_MS },
  punch: { next: "idle", duration: THREE_HUNDRED_MS },
  hook: { next: "idle", duration: THREE_HUNDRED_MS },
  lowKick: { next: "idle", duration: FIVE_HUNDRED_MS },
  airGrab: { next: "airKick", duration: EMATRON_AIR_GRAB_DURATION_MS },
  airKick: { next: "idle", duration: THREE_HUNDRED_MS },

  preWalk: { next: "walk", duration: ONE_HUNDRED_MS },
  walk: { next: "preRun", duration: TWO_HUNDRED_MS },

  preRun: { next: "run", duration: ONE_HUNDRED_FIFTY_MS },
  run: null, // contínuo

  preJump: null,
  jump: null,
  falling: null, // controlado pela gravidade
  fallingAttack: { next: "falling", duration: TWO_HUNDRED_MS },
  preAbilityInAir: { next: "abilityInAir", duration: ONE_HUNDRED_MS },
  abilityInAir: { next: "abilityInAirFinish", duration: TWO_HUNDRED_MS },
  abilityInAirFinish: { next: "idle", duration: ONE_HUNDRED_FIFTY_MS },

  preAbility: { next: "ability", duration: TWO_HUNDRED_MS },
  preAbility2: { next: "idle", duration: 0 },
  ability: { next: "idle", duration: FIVE_HUNDRED_MS },

  dash: { next: "idle", duration: THREE_HUNDRED_MS },

  charging: { next: "idle", duration: FIVE_HUNDRED_MS },

  // Carga de Ki do ematron: estado controlado pelo hold do botão (useEmatronKiCharge),
  // não avança sozinho — o release volta para idle.
  chargingKi: null,

  blocked: null,
  blockAttack: { next: "idle", duration: THREE_HUNDRED_MS },

  stun: { next: "idle", duration: FIVE_HUNDRED_MS },

  idleCrounched: null,
  walkCrounched: null,

  fallen: null,

  // Passiva "O Abençoado" do natsuki: estado mantido pelo time scale/timer
  // durante a sequência do honored-one, não avança sozinho — o useScene força
  // `idle` quando o áudio termina.
  mostHonored: null,

  // Conversão de energia amaldiçoada em cura do natsuki: troca para o sprite
  // heal.svg por 300ms e volta para idle.
  heal: { next: "idle", duration: THREE_HUNDRED_MS },

  // Genki Dama do ematron: estados controlados pelo hold (useEmatronGenkiDama),
  // não avançam sozinhos — o hook troca os sprites conforme a fase.
  genkiDamaRising: null,
  preparingGenkiDama: null,
  throwGenkiDama: null,

  // Laser da Forma Vastolord do marshadow: estado mantido pelo hook por 3s
  // (useVastolordLaser), que restaura o idle quando o feixe termina.
  laser: null,

  // Kamehameha do ematron: fase de disparo (efeito) mantida pelo hook
  // `useKamehameha`, que restaura o idle quando o efeito (2s) termina.
  kamehameha: null,

  // Kamehameha do ematron: fase de carregamento (sprite `chargingKamehameha.svg`)
  // controlada pelo hook `useKamehameha` (2.8s), que troca para o disparo
  // (`kamehameha`) quando o carregamento termina.
  chargingKamehameha: null,

  // "Gran Rey Cero" do marshadow: estado mantido pelo hook enquanto a lâmina
  // corre/rasteja (useGranReyCero), que restaura o idle no fade-out.
  granReyCero: null,

  // "I Am Atomic" do marshadow: estados da sequência controlados pelo hook
  // (useAtomic), que restaura o idle quando a animação termina.
  preparingAtomic: null,
  finalizatingAtomic: null,

  // Expansão de Domínio do marshadow: estados da sequência controlados pelo hook
  // (useDomainExpansion), que restaura o idle quando o mugetsuEffect termina.
  preMugetsu: null,
  mugetsu: null,

  hakai: null,

  // Expansão de Domínio do natsuki (Muryōkūsho): o hook
  // (useNatsukiDomainExpansion) segura a pose `rioiki.svg` por 5s e restaura o
  // idle quando o domínio (e a quebra do vidro) termina.
  rioiki: null,

  // Esferas do natsuki (blue/red + a fusão na purple): estados da sequência
  // Setup controlados pelo hook (useNatsukiSpheres), que restaura o idle ao
  // fim do cast/arremesso. `purpleJunction` é o sprite de fusão.
  purpleJunction: null,
  sphereCast: null,
  sphereMove: null,
  sphereFire: null,
  blueSphereControl: null,
};

type AbilityFlowOverride = {
  preAbility: { next: PlayerState; duration: number };
  preAbility2: { next: PlayerState; duration: number };
  // Opcional: como `ability` normalmente avança sozinho para `idle`, o srGuaxinim
  // o segura (duração gigante) durante toda a coreografia da Killer Queen.
  // O hook `useSrGuaxinimKillerQueen` força `idle` quando a sequência termina.
  ability?: { next: PlayerState; duration: number };
};

export const CHARACTER_ABILITY_FLOWS: Partial<
  Record<CharacterId, AbilityFlowOverride>
> = {
  natsuki: {
    preAbility: { next: "preAbility2", duration: FOUR_HUNDRED_MS },
    preAbility2: { next: "ability", duration: EIGHT_HUNDRED_MS },
  },
  srGuaxinim: {
    preAbility: { next: "preAbility2", duration: FOUR_HUNDRED_MS },
    preAbility2: { next: "ability", duration: FIVE_HUNDRED_MS },
    ability: { next: "idle", duration: 999_999_999 },
  },
};

export function getAbilityFlowOverride(
  characterId: CharacterId,
): AbilityFlowOverride | null {
  return CHARACTER_ABILITY_FLOWS[characterId] ?? null;
}

/**
 * Nomes antigos dos estados de habilidade, de quando a família ainda se chamava
 * "special". Existe só para a leitura de dados persistidos (frames de replay
 * gravados antes do rename) — o código novo nunca usa estes literais.
 */
export const LEGACY_PLAYER_STATE_ALIASES: Record<string, PlayerState> = {
  preSpecial: "preAbility",
  preSpecial2: "preAbility2",
  special: "ability",
  preSpecialInAir: "preAbilityInAir",
  specialInAir: "abilityInAir",
  specialInAirFinish: "abilityInAirFinish",
};

/** Resolve um estado vindo de dado antigo (replay) para o nome atual. */
export function migratePlayerState(state: PlayerState): PlayerState {
  return LEGACY_PLAYER_STATE_ALIASES[state] ?? state;
}
