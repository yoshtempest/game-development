import { NpcAttack } from "@/services/npc/npcAttack";
import { chasePlayer } from "@/gameRules/npc/movement";
import { clampX } from "@/gameRules/movement/clampX";
import {
  TWO_HUNDRED_MS,
  FOUR_HUNDRED_MS,
  SIX_HUNDRED_MS,
} from "@/data/ms";
import type {
  BehaviorContext,
  BehaviorResult,
} from "@/utils/types/npc/npcBehavior";

const MELEE_RANGE = 60;
const JUMP_THRESHOLD = 120;

type TVAi = {
  nextAttack: "punch" | "kick";
  jumping: boolean;
  jumpStart: number;
  jumpFromX: number;
  jumpToX: number;
  attackState: "prePunch" | "punch" | "preKick" | "kick" | null;
  attackStart: number;
  hitDelivered: boolean;
};

export class TrueVandinhaAttack extends NpcAttack {
  constructor() {
    super("trueVandinha");
  }

  execute(ctx: BehaviorContext): BehaviorResult {
    const {
      npc,
      targetX,
      targetY,
      onMeleeHit,
      onPushPlayer,
      npcPhase,
    } = ctx;

    // Primeira fase: persegue o jogador mas não causa dano (sem melee).
    if (npcPhase === 1) {
      const { x } = chasePlayer(npc, targetX, targetY, 1, 9999);
      return { x, y: npc.y, state: "walk" };
    }

    // Segunda fase: dois ataques (punch/kick) alternados + pulo à distância.
    if (!npc.ai) npc.ai = {};
    const aiContainer = npc.ai as Record<string, unknown>;
    if (!aiContainer.trueVandinha) {
      aiContainer.trueVandinha = {
        nextAttack: "punch",
        jumping: false,
        jumpStart: 0,
        jumpFromX: npc.x,
        jumpToX: npc.x,
        attackState: null,
        attackStart: 0,
        hitDelivered: false,
      } satisfies TVAi;
    }
    const ai = aiContainer.trueVandinha as TVAi;

    const now = Date.now();
    const distance = Math.abs(npc.x - targetX);

    // Pulo em direção ao jogador quando distante.
    if (ai.jumping) {
      const elapsed = now - ai.jumpStart;
      const dur = SIX_HUNDRED_MS;
      const t = Math.min(elapsed / dur, 1);
      const x = ai.jumpFromX + (ai.jumpToX - ai.jumpFromX) * t;
      let state: "jump" | "falling" | "default" =
        elapsed < 300 ? "jump" : "falling";
      if (elapsed >= dur) {
        ai.jumping = false;
        state = "default";
      }
      return { x: clampX(x), y: npc.y, state };
    }

    if (distance > JUMP_THRESHOLD && !ai.attackState) {
      ai.jumping = true;
      ai.jumpStart = now;
      ai.jumpFromX = npc.x;
      ai.jumpToX = clampX(targetX + (npc.x > targetX ? 40 : -40));
      return { x: npc.x, y: npc.y, state: "jump" };
    }

    // Ataque em andamento.
    if (ai.attackState) {
      const elapsed = now - ai.attackStart;
      if (ai.attackState === "prePunch") {
        if (elapsed < TWO_HUNDRED_MS) {
          return { x: npc.x, y: npc.y, state: "prePunch" };
        }
        ai.attackState = "punch";
        ai.attackStart = now;
        if (!ai.hitDelivered) {
          ai.hitDelivered = true;
          onMeleeHit?.(1);
        }
        return { x: npc.x, y: npc.y, state: "punch" };
      }
      if (ai.attackState === "punch") {
        if (elapsed < FOUR_HUNDRED_MS) {
          return { x: npc.x, y: npc.y, state: "punch" };
        }
        ai.attackState = null;
        ai.nextAttack = "kick";
        return { x: npc.x, y: npc.y, state: "default" };
      }
      if (ai.attackState === "preKick") {
        if (elapsed < TWO_HUNDRED_MS) {
          return { x: npc.x, y: npc.y, state: "preKick" };
        }
        ai.attackState = "kick";
        ai.attackStart = now;
        if (!ai.hitDelivered) {
          ai.hitDelivered = true;
          onMeleeHit?.(1);
          onPushPlayer?.(npc.x);
        }
        return { x: npc.x, y: npc.y, state: "kick" };
      }
      if (ai.attackState === "kick") {
        if (elapsed < FOUR_HUNDRED_MS) {
          return { x: npc.x, y: npc.y, state: "kick" };
        }
        ai.attackState = null;
        ai.nextAttack = "punch";
        return { x: npc.x, y: npc.y, state: "default" };
      }
    }

    // Inicia ataque quando ao alcance.
    if (distance <= MELEE_RANGE) {
      if (ai.nextAttack === "punch") {
        ai.attackState = "prePunch";
        ai.attackStart = now;
        ai.hitDelivered = false;
        return { x: npc.x, y: npc.y, state: "prePunch" };
      }
      ai.attackState = "preKick";
      ai.attackStart = now;
      ai.hitDelivered = false;
      return { x: npc.x, y: npc.y, state: "preKick" };
    }

    // Perseguição.
    const { x } = chasePlayer(npc, targetX, targetY, 1, MELEE_RANGE);
    return { x, y: npc.y, state: "walk" };
  }
}
