import { NpcAttack } from "@/services/npc/npcAttack";
import { NPC_MELEE_COOLDOWN } from "@/data/cooldowns";
import { EIGHT_HUNDRED_MS, THREE_HUNDRED_MS } from "@/data/ms";
import { chasePlayer } from "@/gameRules/npc/movement";
import { canAttack, isNear } from "@/gameRules/npc/behavior";
import type {
  BehaviorContext,
  BehaviorResult,
} from "@/utils/types/npc/npcBehavior";

const MELEE_RANGE = 45;
const CHASE_SPEED = 0.8;
const SHUSH_RANGE = 220;
const SHUSH_COOLDOWN = 6000;
const SHUSH_DURATION = EIGHT_HUNDRED_MS;
const MELEE_VISUAL_DURATION = THREE_HUNDRED_MS;

/**
 * Vigia Joaquim, guardião da Biblioteca.
 *
 * Mecânica: "Silêncio na biblioteca!". É o vigia mais lento (persegue a 0.8×),
 * mas a cada `SHUSH_COOLDOWN` ele para e manda um "Shhh!" que paralisa o
 * jogador que estiver a até `SHUSH_RANGE` (`onApplyDebuff`). A paralisia passa
 * pelo `applyPlayerStatus`, então duração e imunidade continuam vindo do ponto
 * único de status. Sair do alcance do "Shhh" durante a pausa dele é a
 * resposta que a luta espera.
 */
export class VigiaJoaquimAttack extends NpcAttack {
  constructor() {
    super("vigiaJoaquim");
  }

  execute(ctx: BehaviorContext): BehaviorResult {
    const { npc, targetX, targetY, lastAttackRef, onMeleeHit } = ctx;
    const now = Date.now();

    if (!npc.ai) npc.ai = {};
    if (!npc.ai.vigiaJoaquim) {
      npc.ai.vigiaJoaquim = { lastShush: now, shushUntil: 0 };
    }
    const state = npc.ai.vigiaJoaquim;

    if (now < state.shushUntil) {
      return { x: npc.x, y: npc.y, state: "rangedAttack" };
    }

    if (now - state.lastShush >= SHUSH_COOLDOWN) {
      state.lastShush = now;
      state.shushUntil = now + SHUSH_DURATION;
      if (Math.abs(npc.x - targetX) <= SHUSH_RANGE) {
        ctx.onApplyDebuff?.("paralyze");
      }
      return { x: npc.x, y: npc.y, state: "rangedAttack" };
    }

    const { x } = chasePlayer(npc, targetX, targetY, CHASE_SPEED, MELEE_RANGE);
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
