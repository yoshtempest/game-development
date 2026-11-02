import { DefaultNpcAttack } from "@/services/npc/npcAttack";
import { chasePlayer } from "@/gameRules/npc/movement";
import type { BehaviorContext } from "@/utils/types/npc/npcBehavior";

export class TrueVandinhaAttack extends DefaultNpcAttack {
  execute(ctx: BehaviorContext) {
    // Primeira fase: persegue o jogador mas não causa dano (sem melee).
    if (ctx.npcPhase === 1) {
      const { x } = chasePlayer(ctx.npc, ctx.targetX, ctx.targetY, 1, 9999);
      return { x, y: ctx.npc.y, state: "walk" as const };
    }
    return super.execute(ctx);
  }
}