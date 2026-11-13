import { NpcAttack } from "@/services/npc/npcAttack";
import type {
  BehaviorContext,
  BehaviorResult,
} from "@/utils/types/npc/npcBehavior";

import { initEvilMortyAi, handlePhaseChange } from "./state";
import { evilMortyPhase1 } from "./phase1";
import { evilMortyPhase2 } from "./phase2";
import { evilMortyPhase3 } from "./phase3";

/**
 * Evil Morty (issue #225): NPC `supreme` de três fases.
 *
 * A IA só decide ataque e movimento. As duas defesas dele — teleporte para
 * trás do jogador (vira "miss") e escudo — não moram aqui: acontecem no
 * instante do golpe do jogador, então ficam em `rollEvilMortyEvasion`
 * (`gameRules/npc/evilMortyEvasion.ts`), chamada pelo `onBeforeNpcHitRef`.
 * A terceira fase existe porque `NPC_PHASE_COUNTS` declara 3 para ele.
 */
export class EvilMortyAttack extends NpcAttack {
  constructor() {
    super("evilMorty");
  }

  execute(ctx: BehaviorContext): BehaviorResult {
    const { npc, npcPhase } = ctx;

    if (!npc.ai) npc.ai = {};
    if (!npc.ai.evilMorty) {
      npc.ai.evilMorty = initEvilMortyAi(npcPhase, npc.y);
    }

    const ai = npc.ai.evilMorty;

    if (npcPhase !== ai.knownPhase) {
      handlePhaseChange(ai, npcPhase);
    }

    if (npcPhase >= 3) return evilMortyPhase3(ctx, ai);
    if (npcPhase === 2) return evilMortyPhase2(ctx, ai);
    return evilMortyPhase1(ctx, ai);
  }
}
