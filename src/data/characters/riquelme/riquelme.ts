import {
  SIXTEEN_MS,
  ONE_HUNDRED_MS,
  ONE_HUNDRED_FIFTY_MS,
  FOUR_HUNDRED_MS,
  FIVE_HUNDRED_MS,
  ONE_THOUSAND_FIVE_HUNDRED_MS,
} from "@/data/ms";

// ── Esferas (blue/red) ─────────────────────────────────────
// Sequência de Setup compartilhada: one.svg (surgimento com blink) → two.svg
// (deslocamento/controle) → three.svg (arremesso da red).

/** Duração do `one.svg`: a esfera surge na cabeça com blink e escala 0.1→1. */
export const SPHERE_SPAWN_MS = ONE_THOUSAND_FIVE_HUNDRED_MS;
/** Duração do blink (silhueta branca → forma normal) no surgimento. */
export const SPHERE_BLINK_MS = FOUR_HUNDRED_MS;
/** Escala inicial da esfera no surgimento (cresce até 1). */
export const SPHERE_SPAWN_SCALE = 0.1;
/** Duração do `two.svg`: a esfera desliza até o centro-direita do personagem. */
export const SPHERE_MOVE_MS = FIVE_HUNDRED_MS;
/** Fade-out/escala→0 do dismiss da blue. */
export const SPHERE_DISMISS_MS = FIVE_HUNDRED_MS;
/** Deslocamento horizontal da esfera ao sair da cabeça (em direção à frente). */
export const SPHERE_OFFSET_X = 90;
/** Altura da esfera acima do pé do personagem (na altura da cabeça). */
export const SPHERE_OFFSET_Y = 70;
/** Tick do loop principal da esfera (movimento/atração/dano): ~60fps. */
export const SPHERE_TICK_MS = SIXTEEN_MS;
/** Velocidade da blue controlada pelo joystick, por tick. */
export const SPHERE_CONTROL_PX = 14;

/** Drain da blue em campo: 1 de energia amaldiçoada a cada 10ms. */
export const BLUE_SPHERE_DRAIN_INTERVAL_MS = 10;
export const BLUE_SPHERE_DRAIN_COST = 1;
/** Dano gravitacional da blue: a cada 100ms sobre quem estiver no raio. */
export const BLUE_SPHERE_DAMAGE_INTERVAL_MS = ONE_HUNDRED_MS;
/** Fração do dano mágico (especial) aplicada por tick de dano. */
export const BLUE_SPHERE_DAMAGE_RATIO = 0.1;
/** Raio de atração/dano da blue. */
export const BLUE_SPHERE_RANGE = 160;
/** Força da atração gravitacional (px por tick), sem impedir a fuga. */
export const BLUE_SPHERE_PULL_PX = 1.6;

/** Duração do voo da red até o alvo. */
export const RED_SPHERE_FLY_MS = FOUR_HUNDRED_MS;
/** Alcance do arremesso da red quando não há alvo à frente. */
export const RED_SPHERE_RANGE = 700;
/** Alcance do golpe da red no ponto de chegada. */
export const RED_SPHERE_HIT_RANGE = 140;
/** Empurrão horizontal aplicado nos alvos acertados pela red. */
export const RED_SPHERE_PUSH = 60;
/** Multiplicador de dano da red (1x o dano especial/mágico). */
export const RED_SPHERE_MULTIPLIER = 1;

/** Cooldown mínimo entre esferas (impede spam de casts). */
export const SPHERE_MIN_COOLDOWN_MS = ONE_HUNDRED_FIFTY_MS;
/**
 * Duração do congelamento do mundo durante o Setup (one + two, com margem):
 * o time effect é limpo ao entrar no controle/arremesso, mas expira sozinho se
 * algo der errado no meio.
 */
export const SPHERE_CAST_FREEZE_MS = SPHERE_SPAWN_MS + SPHERE_MOVE_MS + 1000;
