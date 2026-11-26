import { NpcAttack } from "@/services/npc/npcAttack";
import { NPC_MELEE_COOLDOWN } from "@/data/cooldowns";
import { THREE_HUNDRED_MS } from "@/data/ms";
import { chasePlayer } from "@/gameRules/npc/movement";
import { canAttack, isNear } from "@/gameRules/npc/behavior";
import { clampX } from "@/gameRules/movement/clampX";
import type {
  BehaviorContext,
  BehaviorResult,
} from "@/utils/types/npc/npcBehavior";

const MELEE_RANGE = 50;
const DASH_TRIGGER_DISTANCE = 140;
const DASH_COOLDOWN = 4000;
const WIND_UP_DURATION = 600;
const DASH_DURATION = 350;
const DASH_OVERSHOOT = 40;
const DASH_DAMAGE_MULTIPLIER = 1.6;
const RAM_PUSH_DISTANCE = 120;
const MELEE_VISUAL_DURATION = THREE_HUNDRED_MS;

/**
 * Vigia Landô, guardião da passagem secreta para a quadra.
 *
 * Mecânica: investida. Quando o jogador abre distância, Landô para, prepara
 * (`startDash`, um aviso legível de `WIND_UP_DURATION`) e atravessa a arena
 * até um pouco além de onde o jogador estava. Se cruzar o jogador durante a
 * investida, acerta forte uma única vez e o arremessa (`onRamPushPlayer`). O
 * aviso é o que torna a investida justa: pular ou sair da linha durante o
 * preparo é a resposta esperada. Perto, ele só dá melee — é a luta oposta à
 * do Joaquim, que pune ficar perto.
 */
export class VigiaLandoAttack extends NpcAttack {
  constructor() {
    super("vigiaLando");
  }

  execute(ctx: BehaviorContext): BehaviorResult {
    const { npc, targetX, targetY, lastAttackRef, onMeleeHit } = ctx;
    const now = Date.now();

    if (!npc.ai) npc.ai = {};
    if (!npc.ai.vigiaLando) {
      npc.ai.vigiaLando = {
        dashPhase: "idle",
        phaseStart: 0,
        dashStartX: npc.x,
        dashTargetX: npc.x,
        dashHitDone: false,
        lastDash: 0,
      };
    }
    const state = npc.ai.vigiaLando;
    const elapsed = now - state.phaseStart;

    if (state.dashPhase === "windUp") {
      if (elapsed < WIND_UP_DURATION) {
        return { x: npc.x, y: npc.y, state: "startDash" };
      }
      const direction = targetX >= npc.x ? 1 : -1;
      state.dashPhase = "dashing";
      state.phaseStart = now;
      state.dashStartX = npc.x;
      state.dashTargetX = clampX(targetX + direction * DASH_OVERSHOOT);
      state.dashHitDone = false;
      return { x: npc.x, y: npc.y, state: "inDash" };
    }

    if (state.dashPhase === "dashing") {
      const progress = Math.min(1, elapsed / DASH_DURATION);
      const x =
        state.dashStartX + (state.dashTargetX - state.dashStartX) * progress;
      const dashDirection =
        state.dashTargetX >= state.dashStartX ? "right" : "left";

      if (
        !state.dashHitDone &&
        isNear(x, npc.y, targetX, targetY, MELEE_RANGE)
      ) {
        state.dashHitDone = true;
        onMeleeHit(DASH_DAMAGE_MULTIPLIER);
        const pushOffset =
          dashDirection === "right" ? RAM_PUSH_DISTANCE : -RAM_PUSH_DISTANCE;
        ctx.onRamPushPlayer?.(dashDirection, clampX(targetX + pushOffset));
      }

      if (progress >= 1) {
        state.dashPhase = "idle";
        state.lastDash = now;
        lastAttackRef.current = now;
      }
      return { x, y: npc.y, state: "inDash", direction: dashDirection };
    }

    const distanceX = Math.abs(npc.x - targetX);
    if (
      distanceX >= DASH_TRIGGER_DISTANCE &&
      now - state.lastDash >= DASH_COOLDOWN
    ) {
      state.dashPhase = "windUp";
      state.phaseStart = now;
      return { x: npc.x, y: npc.y, state: "startDash" };
    }

    const { x } = chasePlayer(npc, targetX, targetY, 1, MELEE_RANGE);
    const inRange = isNear(npc.x, npc.y, targetX, targetY, MELEE_RANGE);

    if (inRange && canAttack(lastAttackRef, NPC_MELEE_COOLDOWN)) {
      lastAttackRef.current = now;
      onMeleeHit();
      return { x: npc.x, y: npc.y, state: "meleeAttack" };
    }

    if (inRange && now - lastAttackRef.current < MELEE_VISUAL_DURATION) {
      return { x: npc.x, y: npc.y, state: "meleeAttack" };
    }

    if (inRange) return { x: npc.x, y: npc.y };

    return { x, y: npc.y };
  }
}
