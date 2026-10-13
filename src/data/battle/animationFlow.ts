// PlayerState vem do escopo global (src/utils/types/global.d.ts) — fonte única.
import { EMANUEL_AIR_GRAB_DURATION_MS } from "@/data/characters/emanuel/emanuel";
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
  airGrab: { next: "airKick", duration: EMANUEL_AIR_GRAB_DURATION_MS },
  airKick: { next: "idle", duration: THREE_HUNDRED_MS },

  preWalk: { next: "walk", duration: ONE_HUNDRED_MS },
  walk: { next: "preRun", duration: TWO_HUNDRED_MS },

  preRun: { next: "run", duration: ONE_HUNDRED_FIFTY_MS },
  run: null, // contínuo

  preJump: null,
  jump: null,
  falling: null, // controlado pela gravidade
  fallingAttack: { next: "falling", duration: TWO_HUNDRED_MS },
  preSpecialInAir: { next: "specialInAir", duration: ONE_HUNDRED_MS },
  specialInAir: { next: "specialInAirFinish", duration: TWO_HUNDRED_MS },
  specialInAirFinish: { next: "idle", duration: ONE_HUNDRED_FIFTY_MS },

  preSpecial: { next: "special", duration: TWO_HUNDRED_MS },
  preSpecial2: { next: "idle", duration: 0 },
  special: { next: "idle", duration: FIVE_HUNDRED_MS },

  dash: { next: "idle", duration: THREE_HUNDRED_MS },

  charging: { next: "idle", duration: FIVE_HUNDRED_MS },

  // Carga de Ki do emanuel: estado controlado pelo hold do botão (useEmanuelKiCharge),
  // não avança sozinho — o release volta para idle.
  chargingKi: null,

  blocked: null,
  blockAttack: { next: "idle", duration: THREE_HUNDRED_MS },

  stun: { next: "idle", duration: FIVE_HUNDRED_MS },

  idleCrounched: null,
  walkCrounched: null,

  fallen: null,

  // Passiva "O Abençoado" do riquelme: estado mantido pelo time scale/timer
  // durante a sequência do honored-one, não avança sozinho — o useScene força
  // `idle` quando o áudio termina.
  mostHonored: null,

  // Conversão de energia amaldiçoada em cura do riquelme: troca para o sprite
  // heal.svg por 300ms e volta para idle.
  heal: { next: "idle", duration: THREE_HUNDRED_MS },

  // Genki Dama do emanuel: estados controlados pelo hold (useEmanuelGenkiDama),
  // não avançam sozinhos — o hook troca os sprites conforme a fase.
  genkiDamaRising: null,
  preparingGenkiDama: null,
  throwGenkiDama: null,

  // Laser da Forma Vastolord do marcelo: estado mantido pelo hook por 3s
  // (useVastolordLaser), que restaura o idle quando o feixe termina.
  laser: null,

  // "Gran Rey Cero" do marcelo: estado mantido pelo hook enquanto a lâmina
  // corre/rasteja (useGranReyCero), que restaura o idle no fade-out.
  granReyCero: null,

  // "I Am Atomic" do marcelo: estados da sequência controlados pelo hook
  // (useAtomic), que restaura o idle quando a animação termina.
  preparingAtomic: null,
  finalizatingAtomic: null,

  // Expansão de Domínio do marcelo: estados da sequência controlados pelo hook
  // (useDomainExpansion), que restaura o idle quando o mugetsuEffect termina.
  preMugetsu: null,
  mugetsu: null,

  // Expansão de Domínio do riquelme (Muryōkūsho): o hook
  // (useRiquelmeDomainExpansion) segura a pose `rioiki.svg` por 5s e restaura o
  // idle quando o domínio (e a quebra do vidro) termina.
  rioiki: null,

  // Esferas do riquelme (blue/red + a fusão na purple): estados da sequência
  // Setup controlados pelo hook (useRiquelmeSpheres), que restaura o idle ao
  // fim do cast/arremesso. `purpleJunction` é o sprite de fusão.
  purpleJunction: null,
  sphereCast: null,
  sphereMove: null,
  sphereFire: null,
  blueSphereControl: null,
};

type SpecialFlowOverride = {
  preSpecial: { next: PlayerState; duration: number };
  preSpecial2: { next: PlayerState; duration: number };
  // Opcional: como `special` normalmente avança sozinho para `idle`, o artur
  // o segura (duração gigante) durante toda a coreografia da Killer Queen.
  // O hook `useArturKillerQueen` força `idle` quando a sequência termina.
  special?: { next: PlayerState; duration: number };
};

export const CHARACTER_SPECIAL_FLOWS: Partial<
  Record<CharacterId, SpecialFlowOverride>
> = {
  riquelme: {
    preSpecial: { next: "preSpecial2", duration: FOUR_HUNDRED_MS },
    preSpecial2: { next: "special", duration: EIGHT_HUNDRED_MS },
  },
  artur: {
    preSpecial: { next: "preSpecial2", duration: FOUR_HUNDRED_MS },
    preSpecial2: { next: "special", duration: FIVE_HUNDRED_MS },
    special: { next: "idle", duration: 999_999_999 },
  },
};

export function getSpecialFlowOverride(
  characterId: CharacterId,
): SpecialFlowOverride | null {
  return CHARACTER_SPECIAL_FLOWS[characterId] ?? null;
}
