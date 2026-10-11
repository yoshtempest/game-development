import {
  ONE_HUNDRED_MS,
  ONE_HUNDRED_FIFTY_MS,
  THREE_HUNDRED_MS,
} from "@/data/ms";
import { ALL_STATES } from "@/gameRules/battle/playerStates";

export const EMANUEL_COMBO_WINDOW_MS = THREE_HUNDRED_MS;
export const EMANUEL_AIR_LAUNCH_MS = ONE_HUNDRED_MS;
export const EMANUEL_AIR_GRAB_DURATION_MS = ONE_HUNDRED_FIFTY_MS;

// ── Habilidade de instância (clone de silhueta) ─────────────────────────────
/** Ki mínimo para iniciar a habilidade (o custo real é proporcional à distância). */
export const EMANUEL_CLONE_MIN_KI = 1;
/** Teto de Ki consumido no release (proporcional à distância percorrida). */
export const EMANUEL_CLONE_MAX_COST = 50;
/** Ki consumido por pixel de distância percorrida pelo clone. */
export const EMANUEL_CLONE_KI_PER_PIXEL = 0.05;
/** Time scale aplicado na batalha enquanto o botão está segurado. */
export const EMANUEL_CLONE_TIME_SCALE = 0.5;
/** Intervalo do tick de movimento da instância (~2x a velocidade do player). */
export const EMANUEL_CLONE_MOVE_TICK_MS = 16;
/** Passo de movimento da instância por tick. */
export const EMANUEL_CLONE_MOVE_PX = 10;
/** Caixa de colisão da instância contra o terreno. */
export const EMANUEL_CLONE_COLLISION_W = 30;
export const EMANUEL_CLONE_COLLISION_H = 50;

// ── Habilidade de carga de Ki ────────────────────────────────────────────────
/** Intervalo do tick de recarga: +1 de Ki a cada 100ms enquanto segura. */
export const EMANUEL_KI_CHARGE_TICK_MS = 100;
/** Quantidade de Ki restaurada por tick da carga. */
export const EMANUEL_KI_CHARGE_PER_TICK = 1;
/** Tamanho base do effect `chargingKiEffect.svg` em relação ao personagem (1.2x). */
export const EMANUEL_KI_CHARGE_EFFECT_SIZE_MULTIPLIER = 1.2;
/** Proporção altura/largura do sprite `chargingKiEffect.svg` (600x508). */
export const EMANUEL_KI_CHARGE_EFFECT_ASPECT = 508 / 600;

// ── Habilidade Genki Dama ────────────────────────────────────────────────────
/** Custo inicial (Ki) para iniciar a habilidade. */
export const GENKI_DAMA_INITIAL_COST = 10;
/** Duração da subida até o topo (2.5s). */
export const GENKI_DAMA_RISE_MS = 2500;
/** Altura total da subida em y (300px). */
export const GENKI_DAMA_RISE_Y = 300;
/** Intervalo de dreno inicial enquanto segura: 1 Ki por 200ms. */
export const GENKI_DAMA_DRAIN_START_INTERVAL_MS = 200;
/** Intervalo de dreno final enquanto segura: 1 Ki por 40ms. */
export const GENKI_DAMA_DRAIN_END_INTERVAL_MS = 40;
/** Tempo para o dreno rampar do intervalo inicial ao final (5s). */
export const GENKI_DAMA_DRAIN_RAMP_MS = 5000;
/** Intervalo de crescimento da instância da Genki Dama (1x por segundo). */
export const GENKI_DAMA_GROW_INTERVAL_MS = 1;
/** Multiplicador de tamanho por segundo no sprite preparingGenkiDama (1.2x). */
export const GENKI_DAMA_GROW_MULTIPLIER = 1.0015;
/** Teto do multiplicador de dano (7x o dano do ataque básico). */
export const GENKI_DAMA_MAX_DAMAGE_MULTIPLIER = 7;
/** Duração do voo da Genki Dama até o inimigo. */
export const GENKI_DAMA_THROW_MS = 500;
/** Raio de área base (scale unitário); escala com o tamanho da Genki Dama. */
export const GENKI_DAMA_BASE_RADIUS = 120;
/** Tempo exibindo idleCrounched ao pousar antes de voltar para idle. */
export const GENKI_DAMA_LAND_CROUCH_MS = 150;
/** Tamanho base (px) do sprite da Genki Dama. */
export const GENKI_DAMA_BASE_SIZE = 44;
/** Altura da Genki Dama acima do personagem durante o preparing. */
export const GENKI_DAMA_HOVER_OFFSET = 70;
/** Proporção altura/largura do sprite `genkiDama.svg` (761x642). */
export const GENKI_DAMA_SPRITE_ASPECT = 642 / 761;
/** Multiplicador de tamanho do chargeEffect em relação à Genki Dama (sempre maior). */
export const GENKI_DAMA_CHARGE_EFFECT_SIZE_MULTIPLIER = 1.6;
/** Proporção altura/largura do sprite `chargeEffect.svg` (1000x667). */
export const GENKI_DAMA_CHARGE_EFFECT_ASPECT = 667 / 1000;

export type EmanuelComboStep = {
  state: PlayerState;
  multiplier: number;
  windupState: PlayerState;
  /** Distância que o inimigo é empurrado para trás no golpe. */
  pushDistance: number;
  /** Distância que o Emanuel avança em direção ao inimigo no golpe. */
  forwardDistance: number;
};

export const EMANUEL_COMBO_STEPS = [
  {
    state: "punch",
    multiplier: 1,
    windupState: "preAttack",
    pushDistance: 20,
    forwardDistance: 30,
  },
  {
    state: "hook",
    multiplier: 1.15,
    windupState: "preAttack",
    pushDistance: 30,
    forwardDistance: 38,
  },
  {
    state: "lowKick",
    multiplier: 1.3,
    windupState: "lowKick",
    pushDistance: 42,
    forwardDistance: 44,
  },
  {
    state: "airKick",
    multiplier: 1.5,
    windupState: "jump",
    pushDistance: 56,
    forwardDistance: 50,
  },
] as const satisfies readonly EmanuelComboStep[];

/**
 * Estados em que o combo está em exibição (golpe de solo ou golpe aéreo).
 * Derivado dos grupos de estado para não repetir literais.
 */
export const EMANUEL_COMBO_STATES = ALL_STATES.COMBO_STATES;
