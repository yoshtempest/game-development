import type {
  BehaviorContext,
  BehaviorResult,
} from "@/utils/types/npc/npcBehavior";

import type { EvilMortyAI } from "./state";
import {
  AERIAL_COOLDOWN_MS,
  AIR_JUMP_HEIGHT,
  ARENA_WIDTH,
  AURA_DAMAGE_MULT,
  AURA_DURATION_MS,
  AURA_RADIUS,
  AURA_TICK_MS,
  BEAM_TICK_MS,
  DOMAIN_CHARGE_MS,
  DOMAIN_COOLDOWN_MS,
  DOMAIN_LASER_DAMAGE_MULT,
  DOMAIN_LASER_MS,
  MINE_JUMP_DURATION_MS,
  ROCKET_INTERVAL_PHASE3,
  ROCKETS_COOLDOWN_MS,
  SPECIAL_COOLDOWN_MS,
  TIME_STOP_MS,
} from "./state";
import {
  advanceAction,
  chaseAndJump,
  consumeTick,
  dropMines,
  endAction,
  isInBeam,
  jumpArcY,
  startAction,
  updateMines,
} from "./actions";
import { runRockets, startRockets } from "./phase2";

/**
 * Expansão de Domínio: aperta o botão (o tempo para — `freeze` no jogador),
 * carrega e dispara o feixe gigante por 7s.
 *
 * O feixe pega o mapa inteiro na direção travada, no chão e no ar (é 3× maior
 * que o da fase 2, então pular não salva). A saída é estar do outro lado dele
 * quando o tempo voltar a andar.
 */
function runDomainExpansion(
  ctx: BehaviorContext,
  ai: EvilMortyAI,
  now: number,
): BehaviorResult {
  const { npc, playerX } = ctx;

  if (ai.action === "timeStop") {
    if (now - ai.actionStart >= TIME_STOP_MS) {
      advanceAction(ai, "domainCharge", now);
    }
    return {
      x: npc.x,
      y: ai.groundY,
      state: "invoking",
      direction: ai.actionDirection,
    };
  }

  if (ai.action === "domainCharge") {
    if (now - ai.actionStart >= DOMAIN_CHARGE_MS) {
      advanceAction(ai, "domainLaser", now);
    }
    return {
      x: npc.x,
      y: ai.groundY,
      state: "charging",
      direction: ai.actionDirection,
    };
  }

  if (now - ai.actionStart >= DOMAIN_LASER_MS) {
    endAction(ai);
    ai.lastDomain = now;
    return { x: npc.x, y: ai.groundY, state: "idle" };
  }

  if (
    consumeTick(ai, now, BEAM_TICK_MS) &&
    isInBeam(npc.x, ai.actionDirection, ARENA_WIDTH, playerX)
  ) {
    ctx.onMeleeHit(DOMAIN_LASER_DAMAGE_MULT, "true");
  }

  return {
    x: npc.x,
    y: ai.groundY,
    state: "laser",
    direction: ai.actionDirection,
  };
}

/**
 * Fase 3 (irritado): foguetes em dobro, minas terrestres no ataque aéreo,
 * aura vermelha de special e a Expansão de Domínio.
 */
export function evilMortyPhase3(
  ctx: BehaviorContext,
  ai: EvilMortyAI,
): BehaviorResult {
  const now = Date.now();
  const { npc, playerX } = ctx;

  updateMines(ctx, ai, now);

  if (
    ai.action === "timeStop" ||
    ai.action === "domainCharge" ||
    ai.action === "domainLaser"
  ) {
    return runDomainExpansion(ctx, ai, now);
  }

  if (ai.action === "rockets") {
    return runRockets(ctx, ai, now, ROCKET_INTERVAL_PHASE3);
  }

  if (ai.action === "mineJump") {
    const progress = (now - ai.actionStart) / MINE_JUMP_DURATION_MS;
    if (!ai.minesDropped && progress >= 0.5) {
      ai.minesDropped = true;
      dropMines(ai, playerX, now);
    }
    if (progress >= 1) {
      endAction(ai);
      ai.lastAerial = now;
      return { x: npc.x, y: ai.groundY, state: "landing" };
    }
    return {
      x: npc.x,
      y: jumpArcY(ai.groundY, progress, AIR_JUMP_HEIGHT),
      state: "airAttack",
    };
  }

  if (ai.action === "aura") {
    if (now - ai.actionStart >= AURA_DURATION_MS) {
      endAction(ai);
      ai.lastSpecial = now;
      return { x: npc.x, y: ai.groundY, state: "idle" };
    }
    if (
      consumeTick(ai, now, AURA_TICK_MS) &&
      Math.abs(playerX - npc.x) <= AURA_RADIUS
    ) {
      ctx.onMeleeHit(AURA_DAMAGE_MULT, "magical");
      if (!ai.burnApplied) {
        ai.burnApplied = true;
        ctx.onApplyDebuff?.("burn");
      }
    }
    return { x: npc.x, y: ai.groundY, state: "charging" };
  }

  if (ai.jumpStart !== 0) return chaseAndJump(ctx, ai, now);

  if (now - ai.lastDomain >= DOMAIN_COOLDOWN_MS) {
    startAction(ai, "timeStop", ctx, now);
    ctx.onApplyDebuff?.("freeze");
    return {
      x: npc.x,
      y: ai.groundY,
      state: "invoking",
      direction: ai.actionDirection,
    };
  }

  if (now - ai.lastSpecial >= SPECIAL_COOLDOWN_MS) {
    startAction(ai, "aura", ctx, now);
    return { x: npc.x, y: ai.groundY, state: "charging" };
  }

  if (now - ai.lastAerial >= AERIAL_COOLDOWN_MS) {
    startAction(ai, "mineJump", ctx, now);
    return { x: npc.x, y: ai.groundY, state: "airAttack" };
  }

  if (now - ai.lastBasic >= ROCKETS_COOLDOWN_MS) {
    startRockets(ctx, ai, now);
    return { x: npc.x, y: ai.groundY, state: "invoking" };
  }

  return chaseAndJump(ctx, ai, now);
}
