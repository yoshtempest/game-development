export const ATTACK_FOLDER_ALT = new Set([
  "marcelo",
  "artur",
  "riquelme",
  "lucaua",
  "levi",
  "lucas",
  "larissa",
  "camilly",
  "mayra",
  "emanuel",
]);

// Emanuel não tem as pastas de movimento na raiz do `inFight/` (diferente do
// riquelme/marcelo que têm `inFight/idle/`, `inFight/jump/` + `.svg` soltos).
// Tudo que é movimento fica aninhado em `inFight/movement/`:
//   idle  → inFight/movement/idle/idle.svg
//   jump  → inFight/movement/jump/jump.svg
//   run   → inFight/movement/movement/run.svg
// Isso exige um mapeamento por character + estado (o STATE_FOLDER genérico
// retorna "idle"/"jump"/"movement" como pasta raiz do inFight → 404 p/ emanuel).
export const CHARACTER_STATE_FOLDER_ALT: Record<
  string,
  Partial<Record<PlayerState, string>>
> = {
  emanuel: {
    idle: "movement/idle",
    idleCrounched: "movement/idle",
    walk: "movement/movement",
    run: "movement/movement",
    preWalk: "movement/movement",
    preRun: "movement/movement",
    jump: "movement/jump",
    preJump: "movement/jump",
    falling: "movement/jump",
  },
  marcelo: {
    // O marcelo NÃO tem pasta de movimento própria na raiz do inFight:
    // as animações de andar/atacar ficam em `inFight/default/${state}.svg`
    // (tratado no branch abaixo via default/), então aqui já cai o override.
  },
};

/**
 * Sprites da Forma Vastolord do marcelo: depois que a transformação começa, o
 * personagem SÓ pode usar sprites de `vastolordForm/` até o fim da batalha.
 * Os estados que não têm sprite dedicado no folder caem no `idle` da forma.
 */
export const MARCELO_VASTOLORD_SPRITES: Partial<Record<PlayerState, string>> = {
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

/**
 * Sequência de Setup das esferas do riquelme (blue/red), em `habilities/Setup/`:
 * `one.svg` é o surgimento com blink, `two.svg` o deslocamento/controle e
 * `three.svg` o arremesso da red.
 */
export const RIQUELME_SPHERE_SETUP_SPRITES: Partial<
  Record<PlayerSphereState, string>
> = {
  sphereCast: "one",
  sphereMove: "two",
  blueSphereControl: "two",
  sphereFire: "three",
};
