import { NpcAttack } from "@/services/npc/npcAttack";
import { NPC_MELEE_COOLDOWN } from "@/data/cooldowns";
import { ONE_THOUSAND_MS, THREE_HUNDRED_MS } from "@/data/ms";
import { chasePlayer } from "@/gameRules/npc/movement";
import { canAttack, isNear } from "@/gameRules/npc/behavior";
import type {
  BehaviorContext,
  BehaviorResult,
} from "@/utils/types/npc/npcBehavior";

const MELEE_RANGE = 50;
const HITS_BEFORE_PUSH = 2;
const PUSH_DAMAGE_MULTIPLIER = 1.3;
const PUSH_VISUAL_DURATION = ONE_THOUSAND_MS;
const MELEE_VISUAL_DURATION = THREE_HUNDRED_MS;

/**
 * Vigia João, guardião da Sala dos Professores.
 *
 * Mecânica: "Daqui você não passa". Ele não agarra como o Jhowsimar — ele
 * protege a porta. Depois de `HITS_BEFORE_PUSH` golpes comuns, o seguinte vira
 * um empurrão mais forte que joga o jogador para longe (`onPushPlayer`),
 * obrigando quem luta corpo a corpo a reconquistar a distância o tempo todo.
 * Quem luta de longe é punido menos, e essa é a leitura que a luta ensina.
 */
export class VigiaJoaoAttack extends NpcAttack {
  constructor() {
    super("vigiaJoao");
  }

  execute(ctx: BehaviorContext): BehaviorResult {
    const { npc, targetX, targetY, lastAttackRef, onMeleeHit } = ctx;
    const now = Date.now();

    if (!npc.ai) npc.ai = {};
    if (!npc.ai.vigiaJoao) {
      npc.ai.vigiaJoao = { hitCount: 0, pushUntil: 0 };
    }
    const state = npc.ai.vigiaJoao;

    if (now < state.pushUntil) {
      return { x: npc.x, y: npc.y, state: "attack" };
    }

    const { x } = chasePlayer(npc, targetX, targetY, 1, MELEE_RANGE);
    const inRange = isNear(npc.x, npc.y, targetX, targetY, MELEE_RANGE);

    if (inRange && canAttack(lastAttackRef, NPC_MELEE_COOLDOWN)) {
      lastAttackRef.current = now;

      if (state.hitCount >= HITS_BEFORE_PUSH) {
        state.hitCount = 0;
        state.pushUntil = now + PUSH_VISUAL_DURATION;
        ctx.playSound?.("slap");
        onMeleeHit(PUSH_DAMAGE_MULTIPLIER);
        ctx.onPushPlayer?.(npc.x);
        return { x: npc.x, y: npc.y, state: "attack" };
      }

      state.hitCount++;
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
