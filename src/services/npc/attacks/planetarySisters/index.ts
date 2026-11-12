import { NpcAttack, DefaultNpcAttack } from "@/services/npc/npcAttack";
import { NPC_MELEE_COOLDOWN } from "@/data/cooldowns";
import { chasePlayer } from "@/gameRules/npc/movement";
import { tryMeleeAttack } from "@/gameRules/npc/attack";
import { BATTLE_SPAWN } from "@/gameRules/battle/spawnPoints";
import type {
  BehaviorContext,
  BehaviorResult,
} from "@/utils/types/npc/npcBehavior";
import type { NPCBattleState } from "@/utils/types/npc/npc";

import {
  initPlanetarySistersAi,
  type PlanetarySistersAI,
  MELEE_RANGE,
  JUMP_THRESHOLD,
  JUMP_COOLDOWN_MS,
  JUMP_DURATION_MS,
  JUMP_RISE_MS,
  JUMP_FLIGHT_MS,
  JUMP_RECOVERY_MS,
  JUMP_HEIGHT,
  JUMP_HIT_RADIUS,
  JUMP_DAMAGE_MULTIPLIER,
  SLAM_TRIGGER_RANGE,
  SLAM_AREA,
  SLAM_WIND_UP_MS,
  SLAM_IMPACT_MS,
  SLAM_COOLDOWN_MS,
  SLAM_DAMAGE_MULTIPLIER,
  PARRY_FALL_MS,
  SPIN_DURATION_MS,
  SPIN_START_MS,
  SPIN_FINISH_MS,
  SPIN_COOLDOWN_MS,
  SPIN_TRIGGER_RANGE,
  SPIN_HIT_RANGE,
  SPIN_TICK_MS,
  SPIN_SPEED,
  SPIN_DAMAGE_MULTIPLIER,
} from "./state";

/**
 * Fase 2 ainda é o ataque padrão: a fusão "Maria Maria" (batalha de
 * sobrevivência de 1 minuto, issue #298) fica para a próxima entrega. Manter
 * o fallback explícito evita que a fase 2 reaproveite os golpes da Marquesa
 * como se fossem da fusão.
 */
const PHASE_2_PLACEHOLDER = new DefaultNpcAttack("planetarySisters");

function jumpSpriteState(elapsed: number): NPCBattleState["state"] {
  if (elapsed < JUMP_RISE_MS) return "jumping";
  if (elapsed < JUMP_RISE_MS + JUMP_FLIGHT_MS) return "inJump";
  return "jumpAttack";
}

function spinSpriteState(elapsed: number): NPCBattleState["state"] {
  if (elapsed < SPIN_START_MS) return "startSpin";
  if (elapsed < SPIN_DURATION_MS - SPIN_FINISH_MS) return "inSpin";
  return "finishSpin";
}

/**
 * Diz se o alvo está na área frontal da marretada. A área é só para o lado
 * em que ela estava virada no início da animação — trocar de lado durante o
 * `preAttack` é a forma de esquiva que a issue descreve ("acertam uma área
 * frontal").
 */
function isInFrontArea(
  npcX: number,
  targetX: number,
  direction: "left" | "right",
): boolean {
  const dx = targetX - npcX;
  const ahead = direction === "right" ? dx >= 0 : dx <= 0;
  return ahead && Math.abs(dx) <= SLAM_AREA;
}

/**
 * Marquesa — a irmã planetária que é o NPC principal da fase 1. A Netali
 * entra como companheira (summon com barra de vida própria, ver
 * `BATTLE_COMPANIONS`), então esta IA só cuida dos golpes da Marquesa:
 * marreta básica, pulo com marreta, marretada lenta no chão (área frontal,
 * cai para frente ao sofrer parry) e giro de 2s.
 *
 * Com HP 0 na fase 1 ela fica caída sem agir: o lifecycle segura a troca de
 * fase até a Netali também cair ("fase 2 no momento em que ambas morrem").
 */
export class PlanetarySistersAttack extends NpcAttack {
  constructor() {
    super("planetarySisters");
  }

  execute(ctx: BehaviorContext): BehaviorResult {
    if (ctx.npcPhase >= 2) return PHASE_2_PLACEHOLDER.execute(ctx);

    const { npc } = ctx;
    if (!npc.ai) npc.ai = {};
    if (!npc.ai.planetarySisters) {
      npc.ai.planetarySisters = initPlanetarySistersAi();
    }
    const ai = npc.ai.planetarySisters;

    if ((ctx.npcHp ?? 1) <= 0) {
      return { x: npc.x, y: BATTLE_SPAWN.npc.y, state: "fall" };
    }

    const now = Date.now();
    switch (ai.action) {
      case "jump":
        return this.tickJump(ctx, ai, now);
      case "jumpLanding":
        if (now - ai.actionStart < JUMP_RECOVERY_MS) {
          return { x: npc.x, y: npc.y, state: "jumpAttack" };
        }
        ai.action = "idle";
        break;
      case "slamWindUp":
      case "slamImpact":
        return this.tickSlam(ctx, ai, now);
      case "fallen":
        if (now - ai.actionStart < PARRY_FALL_MS) {
          return {
            x: npc.x,
            y: npc.y,
            state: "fall",
            direction: ai.slamDirection,
          };
        }
        ai.action = "idle";
        break;
      case "spin":
        return this.tickSpin(ctx, ai, now);
      case "idle":
        break;
    }

    return this.chooseAction(ctx, ai, now);
  }

  /**
   * Escolhe o próximo golpe quando está livre. Ordem de prioridade: marretada
   * lenta (perto), giro (média distância), pulo (longe) e por fim a marreta
   * básica perseguindo o player.
   */
  private chooseAction(
    ctx: BehaviorContext,
    ai: PlanetarySistersAI,
    now: number,
  ): BehaviorResult {
    const { npc, targetX, targetY, lastAttackRef, onMeleeHit } = ctx;
    const distance = Math.abs(npc.x - targetX);

    if (
      distance <= SLAM_TRIGGER_RANGE &&
      now - ai.lastSlam >= SLAM_COOLDOWN_MS
    ) {
      ai.action = "slamWindUp";
      ai.actionStart = now;
      ai.lastSlam = now;
      ai.slamDirection = targetX >= npc.x ? "right" : "left";
      return {
        x: npc.x,
        y: npc.y,
        state: "preAttack",
        direction: ai.slamDirection,
      };
    }

    if (
      distance <= SPIN_TRIGGER_RANGE &&
      now - ai.lastSpin >= SPIN_COOLDOWN_MS
    ) {
      ai.action = "spin";
      ai.actionStart = now;
      ai.lastSpin = now;
      ai.lastSpinTick = 0;
      return { x: npc.x, y: npc.y, state: "startSpin" };
    }

    if (distance > JUMP_THRESHOLD && now - ai.lastJump >= JUMP_COOLDOWN_MS) {
      ai.action = "jump";
      ai.actionStart = now;
      ai.lastJump = now;
      ai.jumpTargetX = targetX;
      npc.jumpLandingX = targetX;
      ctx.playSound?.("goatJump");
      return { x: npc.x, y: npc.y, state: "jumping" };
    }

    const { x } = chasePlayer(npc, targetX, targetY, 1, MELEE_RANGE);
    const hit = tryMeleeAttack({
      npcX: npc.x,
      npcY: npc.y,
      playerX: targetX,
      playerY: targetY,
      range: MELEE_RANGE,
      cooldown: NPC_MELEE_COOLDOWN,
      lastAttackRef,
      onHit: onMeleeHit,
    });
    if (hit) {
      ai.lastMeleeAttack = now;
      return { x: npc.x, y: npc.y, state: "meleeAttack" };
    }
    if (now - ai.lastMeleeAttack < NPC_MELEE_COOLDOWN / 2) {
      return { x: npc.x, y: npc.y, state: "meleeAttack" };
    }
    return { x, y: npc.y };
  }

  /** Pulo com marreta: arco até onde o player estava e impacto na queda. */
  private tickJump(
    ctx: BehaviorContext,
    ai: PlanetarySistersAI,
    now: number,
  ): BehaviorResult {
    const { npc, targetX, targetY, onMeleeHit } = ctx;
    const elapsed = now - ai.actionStart;

    if (elapsed < JUMP_DURATION_MS) {
      const progress = elapsed / JUMP_DURATION_MS;
      const height = Math.sin(progress * Math.PI) * JUMP_HEIGHT;
      const newX = npc.x + (ai.jumpTargetX - npc.x) * 0.07;
      return {
        x: newX,
        y: BATTLE_SPAWN.npc.y - height,
        state: jumpSpriteState(elapsed),
      };
    }

    ai.action = "jumpLanding";
    ai.actionStart = now;
    npc.jumpLandingX = undefined;
    ctx.playSound?.("boom");
    if (
      Math.hypot(ai.jumpTargetX - targetX, BATTLE_SPAWN.npc.y - targetY) <
      JUMP_HIT_RADIUS
    ) {
      onMeleeHit(JUMP_DAMAGE_MULTIPLIER);
    }
    return { x: ai.jumpTargetX, y: BATTLE_SPAWN.npc.y, state: "jumpAttack" };
  }

  /**
   * Marretada lenta no chão. O golpe é resolvido uma vez, na virada do
   * `preAttack` para o `attack`: parry nesse instante derruba a irmã para
   * frente (e não causa dano); sem parry, acerta quem está na área frontal.
   */
  private tickSlam(
    ctx: BehaviorContext,
    ai: PlanetarySistersAI,
    now: number,
  ): BehaviorResult {
    const { npc, targetX, onMeleeHit, isPlayerParrying } = ctx;
    const elapsed = now - ai.actionStart;
    const direction = ai.slamDirection;

    if (ai.action === "slamWindUp") {
      if (elapsed < SLAM_WIND_UP_MS) {
        return { x: npc.x, y: npc.y, state: "preAttack", direction };
      }
      ai.action = "slamImpact";
      ai.actionStart = now;
      ctx.playSound?.("boom");

      if (isInFrontArea(npc.x, targetX, direction)) {
        if (isPlayerParrying?.() ?? false) {
          ai.action = "fallen";
          return { x: npc.x, y: npc.y, state: "fall", direction };
        }
        onMeleeHit(SLAM_DAMAGE_MULTIPLIER);
      }
      return { x: npc.x, y: npc.y, state: "attack", direction };
    }

    if (elapsed < SLAM_IMPACT_MS) {
      return { x: npc.x, y: npc.y, state: "attack", direction };
    }
    ai.action = "idle";
    return { x: npc.x, y: npc.y, state: "idle", direction };
  }

  /** Giro de 2s com a marreta: avança no player e bate a cada tick. */
  private tickSpin(
    ctx: BehaviorContext,
    ai: PlanetarySistersAI,
    now: number,
  ): BehaviorResult {
    const { npc, targetX, targetY, onMeleeHit } = ctx;
    const elapsed = now - ai.actionStart;

    if (elapsed >= SPIN_DURATION_MS) {
      ai.action = "idle";
      return { x: npc.x, y: npc.y, state: "idle" };
    }

    const { x } = chasePlayer(npc, targetX, targetY, SPIN_SPEED, 0);
    if (
      Math.abs(npc.x - targetX) <= SPIN_HIT_RANGE &&
      now - ai.lastSpinTick >= SPIN_TICK_MS
    ) {
      ai.lastSpinTick = now;
      onMeleeHit(SPIN_DAMAGE_MULTIPLIER);
    }
    return { x, y: npc.y, state: spinSpriteState(elapsed) };
  }
}
