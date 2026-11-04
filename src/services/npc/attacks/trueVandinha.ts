import { NpcAttack } from "@/services/npc/npcAttack";
import { chasePlayer } from "@/gameRules/npc/movement";
import { clampX } from "@/gameRules/movement/clampX";
import { TWO_HUNDRED_MS, FOUR_HUNDRED_MS, SIX_HUNDRED_MS } from "@/data/ms";
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
  jumpGroundY: number;
  lastJumpTime: number;
  landingStart: number;
  attackState: "prePunch" | "punch" | "preKick" | "kick" | null;
  attackStart: number;
  hitDelivered: boolean;
};

export class TrueVandinhaAttack extends NpcAttack {
  constructor() {
    super("trueVandinha");
  }

  execute(ctx: BehaviorContext): BehaviorResult {
    const { npc, targetX, targetY, onMeleeHit, onPushPlayer, npcPhase } = ctx;

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
        jumpGroundY: npc.y,
        lastJumpTime: 0,
        landingStart: 0,
        attackState: null,
        attackStart: 0,
        hitDelivered: false,
      } satisfies TVAi;
    }
    const ai = aiContainer.trueVandinha as TVAi;

    const now = Date.now();
    const distance = Math.abs(npc.x - targetX);

    // Pausa pós-pulo: mantém default por 300ms se o jogador estiver próximo.
    if (ai.landingStart > 0 && now - ai.landingStart < 300) {
      const dist = Math.abs(npc.x - targetX);
      if (dist <= 200) {
        return { x: npc.x, y: ai.jumpGroundY, state: "default" };
      }
      ai.landingStart = 0;
    }

    // Pulo em direção ao jogador quando distante (1x a cada 2s).
    if (ai.jumping) {
      const elapsed = now - ai.jumpStart;
      const dur = SIX_HUNDRED_MS;
      const t = Math.min(elapsed / dur, 1);
      const x = ai.jumpFromX + (ai.jumpToX - ai.jumpFromX) * t;
      const height = Math.sin(t * Math.PI) * 128;
      const y = ai.jumpGroundY - height;
      let state: "jump" | "falling" | "default" = t < 0.5 ? "jump" : "falling";
      if (elapsed >= dur) {
        ai.jumping = false;
        ai.landingStart = now;
        npc.jumpLandingX = undefined;
        state = "default";
        return { x: clampX(ai.jumpToX), y: ai.jumpGroundY, state };
      }
      return { x: clampX(x), y, state };
    }

    if (
      distance > JUMP_THRESHOLD &&
      !ai.attackState &&
      now - ai.lastJumpTime >= 2000
    ) {
      ai.jumping = true;
      ai.jumpStart = now;
      ai.lastJumpTime = now;
      ai.jumpFromX = npc.x;
      ai.jumpToX = clampX(targetX + (npc.x > targetX ? 40 : -40));
      ai.jumpGroundY = npc.y;
      npc.jumpLandingX = targetX;
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
