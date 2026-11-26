import {
  FOUR_HUNDRED_MS,
  FIVE_HUNDRED_MS,
  SIX_HUNDRED_MS,
  ONE_THOUSAND_TWO_HUNDRED_MS,
  TWO_THOUSAND_MS,
  THREE_HUNDRED_MS,
  FOUR_THOUSAND_MS,
  SEVEN_THOUSAND_MS,
  TEN_THOUSAND_MS,
} from "@/data/ms";

/** Alcance do golpe básico de marreta. */
export const MELEE_RANGE = 50;

/**
 * Pulo com marreta (só a Marquesa pula — issue #298). Mesma curva do Bode
 * (`goat`): subida → voo → aterrissagem que acerta quem estiver perto do
 * ponto de queda.
 */
export const JUMP_THRESHOLD = 200;
export const JUMP_COOLDOWN_MS = FOUR_THOUSAND_MS;
export const JUMP_DURATION_MS = ONE_THOUSAND_TWO_HUNDRED_MS;
export const JUMP_RISE_MS = FOUR_HUNDRED_MS;
export const JUMP_FLIGHT_MS = SIX_HUNDRED_MS;
export const JUMP_RECOVERY_MS = FIVE_HUNDRED_MS;
export const JUMP_HEIGHT = 40;
export const JUMP_HIT_RADIUS = 150;
/** Decisão para revisar: o pulo bate 30% acima do golpe básico. */
export const JUMP_DAMAGE_MULTIPLIER = 1.3;

/**
 * Marretada no chão: animação lenta (o `preAttack` é o aviso que dá tempo de
 * parry ou de sair da frente) e área só **à frente** da irmã — quem está nas
 * costas dela não é atingido.
 */
export const SLAM_TRIGGER_RANGE = 180;
export const SLAM_AREA = 180;
export const SLAM_WIND_UP_MS = ONE_THOUSAND_TWO_HUNDRED_MS;
export const SLAM_IMPACT_MS = FIVE_HUNDRED_MS;
export const SLAM_COOLDOWN_MS = SEVEN_THOUSAND_MS;
/** Decisão para revisar: a marretada lenta é o golpe mais pesado da fase. */
export const SLAM_DAMAGE_MULTIPLIER = 1.8;
/**
 * Tempo caída depois de sofrer parry na marretada ("ao sofrer um parry a NPC
 * cai para frente"). É a janela de punição que recompensa o timing.
 */
export const PARRY_FALL_MS = TWO_THOUSAND_MS;

/** Giro com a marreta: 2s girando (issue #298), andando na direção do player. */
export const SPIN_DURATION_MS = TWO_THOUSAND_MS;
export const SPIN_START_MS = THREE_HUNDRED_MS;
export const SPIN_FINISH_MS = THREE_HUNDRED_MS;
export const SPIN_COOLDOWN_MS = TEN_THOUSAND_MS;
export const SPIN_TRIGGER_RANGE = 260;
export const SPIN_HIT_RANGE = 70;
export const SPIN_TICK_MS = FOUR_HUNDRED_MS;
export const SPIN_SPEED = 2;
/** Decisão para revisar: cada tick do giro tira 60% do golpe básico. */
export const SPIN_DAMAGE_MULTIPLIER = 0.6;

export type PlanetarySistersAction =
  | "idle"
  | "jump"
  | "jumpLanding"
  | "slamWindUp"
  | "slamImpact"
  | "fallen"
  | "spin";

/**
 * Estado da IA da Marquesa (fase 1 das Irmãs Planetárias). Uma ação por vez:
 * `action` + `actionStart` dizem o que está em curso; os `last*` guardam o
 * cooldown de cada golpe para ela alternar os golpes em vez de repetir o mesmo.
 */
export type PlanetarySistersAI = {
  action: PlanetarySistersAction;
  actionStart: number;
  jumpTargetX: number;
  slamDirection: "left" | "right";
  lastJump: number;
  lastSlam: number;
  lastSpin: number;
  lastSpinTick: number;
  lastMeleeAttack: number;
};

/**
 * Cria o estado inicial. Marretada e giro começam "carregando" a partir de
 * agora para a batalha não abrir com os dois golpes pesados de uma vez.
 *
 * @returns O estado da IA pronto para o primeiro tick.
 */
export function initPlanetarySistersAi(): PlanetarySistersAI {
  const now = Date.now();
  return {
    action: "idle",
    actionStart: now,
    jumpTargetX: 0,
    slamDirection: "left",
    lastJump: now - JUMP_COOLDOWN_MS,
    lastSlam: now,
    lastSpin: now,
    lastSpinTick: 0,
    lastMeleeAttack: 0,
  };
}
