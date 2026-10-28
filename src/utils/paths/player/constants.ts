export const ATTACK_FOLDER_ALT = new Set([
  "marshadow",
  "srGuaxinim",
  "natsuki",
  "babidi",
  "levi",
  "yvel",
  "laricell",
  "camyKaze",
  "yra",
  "ematron",
]);

export const CHARACTER_STATE_FOLDER_ALT: Record<
  string,
  Partial<Record<PlayerState, string>>
> = {
  marshadow: {
    // O marshadow NÃO tem pasta de movimento própria na raiz do inFight:
    // as animações de andar/atacar ficam em `inFight/default/${state}.svg`
    // (tratado no branch abaixo via default/), então aqui já cai o override.
  },
};

/**
 * Sprites da Forma Vastolord do marshadow: depois que a transformação começa, o
 * personagem SÓ pode usar sprites de `vastolordForm/` até o fim da batalha.
 * Os estados que não têm sprite dedicado no folder caem no `idle` da forma.
 */
export const MARSHADOW_VASTOLORD_SPRITES: Partial<Record<PlayerState, string>> =
  {
    idle: "idle/idle",
    idleCrounched: "idle/idle",
    walk: "movement/walk",
    preWalk: "movement/walk",
    preRun: "movement/preRun",
    run: "movement/run",
    dash: "movement/run",
    preAttack: "attacks/attack",
    attack: "attacks/attack",
    crit: "attacks/attack",
    blockAttack: "attacks/attack",
    kick: "attacks/attack",
    preKick: "attacks/attack",
    punch: "attacks/attack",
    hook: "attacks/attack",
    lowKick: "attacks/attack",
    airGrab: "attacks/attack",
    airKick: "attacks/attack",
    fallingAttack: "attacks/fallingAttack",
    /** Habilidade Laser da Forma Vastolord: segura o sprite de disparo por 3s. */
    laser: "attacks/laser",
  };

/**
 * "I Am Atomic": os arquivos da sequência são `preparing.svg` /
 * `finalizating.svg`, em `habilities/atomic/`.
 */
export const ATOMIC_SPRITES: Partial<Record<PlayerAtomicState, string>> = {
  preparingAtomic: "preparing",
  finalizatingAtomic: "finalizating",
};

/** Expansão de Domínio: `habilities/domainExpansion/`. */
export const DOMAIN_EXPANSION_SPRITES: Partial<
  Record<PlayerDomainExpansionState, string>
> = {
  preMugetsu: "preMugetsu",
  mugetsu: "mugetsu",
};

/** "Gran Rey Cero": `habilities/granReyCero/granReyCero.svg`. */
export const GRAN_REY_CERO_SPRITES: Partial<
  Record<PlayerGranReyCeroState, string>
> = {
  granReyCero: "granReyCero",
};

export const EMATRON_HABILITIES_SPRITES = {
  chargingKi: "chargingKi/chargingKi",
  preparingGenkiDama: "genkiDama/preparingGenkiDama",
  throwGenkiDama: "genkiDama/throwGenkiDama",
  chargingKamehameha: "kamehameha/chargingKamehameha",
  kamehameha: "kamehameha/kamehameha",
  ability: "teleport/teleport",
  preAbility: "teleport/teleport",
  preAbility2: "teleport/teleport",
} as const;

export const EMATRON_ATTACK_SPRITES = {
  blockAttack: "lowKick",
  fallingAttack: "lowKick",
} as const;

/**
 * Sequência de Setup das esferas do natsuki (blue/red), em `habilities/Setup/`:
 * `one.svg` é o surgimento com blink, `two.svg` o deslocamento/controle e
 * `three.svg` o arremesso da red.
 */
export const NATSUKI_SPHERE_SETUP_SPRITES: Partial<
  Record<PlayerSphereState, string>
> = {
  sphereCast: "one",
  sphereMove: "two",
  blueSphereControl: "two",
  sphereFire: "three",
};
