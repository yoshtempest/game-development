import { NpcAttack } from "@/services/npc/npcAttack";
import { NPC_MELEE_COOLDOWN } from "@/data/cooldowns";
import { chasePlayer } from "@/gameRules/npc/movement";
import { tryMeleeAttack } from "@/gameRules/npc/attack";
import type {
  BehaviorContext,
  BehaviorResult,
} from "@/utils/types/npc/npcBehavior";
import { MELEE_RANGE, initHungryDogAi } from "./state";
import { tryAcidSpit } from "./acidSpit";
import { handleChase } from "./handles/chase";
import { handleDig } from "./handles/dig";
import { handleEmerge } from "./handles/emerge";
import { handleFlee } from "./handles/flee";
import { handleIntro } from "./handles/intro";
import { handleUnderground } from "./handles/underground";

export class HungryDogAttack extends NpcAttack {
  constructor() {
    super("hungryDog");
  }

  execute(ctx: BehaviorContext): BehaviorResult {
    if (ctx.isAlfa) return this.executeAlfa(ctx);
    return this.executeNormal(ctx);
  }

  private executeNormal(ctx: BehaviorContext): BehaviorResult {
    const { npc, targetX, targetY, lastAttackRef, onMeleeHit } = ctx;

    if (tryAcidSpit(ctx)) return { x: npc.x, y: npc.y };

    const { x } = chasePlayer(npc, targetX, targetY, 1, MELEE_RANGE);

    tryMeleeAttack({
      npcX: npc.x,
      npcY: npc.y,
      playerX: targetX,
      playerY: targetY,
      range: MELEE_RANGE,
      cooldown: NPC_MELEE_COOLDOWN,
      lastAttackRef,
      onHit: onMeleeHit,
    });

    return { x, y: npc.y };
  }

  private executeAlfa(ctx: BehaviorContext): BehaviorResult {
    const { npc } = ctx;
    const ai = (npc.ai ??= {});
    if (!ai.hungryDog) ai.hungryDog = initHungryDogAi();
    const state = ai.hungryDog;
    const now = Date.now();

    if (state.phaseStart === 0) {
      state.phaseStart = now;
      state.lastRecharge = now;
    }

    switch (state.phase) {
      case "intro":
        return handleIntro(ctx, state, now);
      case "chase":
        return handleChase(ctx, state, now);
      case "dig":
        return handleDig(ctx, state, now);
      case "underground":
        return handleUnderground(ctx, state, now);
      case "emerge":
        return handleEmerge(ctx, state, now);
      case "flee":
        return handleFlee(ctx, state, now);
    }
  }
}
