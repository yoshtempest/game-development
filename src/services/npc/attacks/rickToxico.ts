import { NpcAttack } from "@/services/npc/npcAttack";

import { chasePlayer } from "@/gameRules/npc/movement";
import { createCommonProjectile } from "@/gameRules/npc/projectile/directionalProjectile";
import { tryThrowProjectile } from "@/gameRules/npc/projectile";

import { NPC_PROJECTILE_COOLDOWN } from "@/data/cooldowns";
import { FOUR_HUNDRED_MS } from "@/data/ms";
import {
  RICK_SMOKE_DURATION_MS,
  RICK_SMOKE_RADIUS,
  RICK_SMOKE_TICK_MS,
  RICK_SMOKE_TICK_MULTIPLIER,
} from "@/data/npc/rickToxico";

import type { NPCBattleState } from "@/utils/types/npc/npc";
import type {
  BehaviorContext,
  BehaviorResult,
} from "@/utils/types/npc/npcBehavior";
import type { DamageKind } from "@/utils/types/battle/damageKind";

/**
 * Distância que o Rick mantém do alvo: ele é atirador, então só se aproxima
 * até onde o frasco ainda faz arco legível na tela.
 */
const PREFERRED_RANGE = 220;
const THROW_IDLE_DURATION = FOUR_HUNDRED_MS;

/**
 * Natureza do frasco e da fumaça. Química, não impacto: fura a armadura
 * mágica. Decisão para revisar no PR (a issue não diz).
 */
const FLASK_DAMAGE_KIND: DamageKind = "magical";

type RickToxicoAI = NonNullable<
  NonNullable<NPCBattleState["ai"]>["rickToxico"]
>;

/**
 * Garante o estado de IA do Rick no NPC. Exportado porque o pipeline de
 * projétil (`useAi`) também escreve nele ao acertar um frasco.
 */
export function ensureRickToxicoAI(npc: NPCBattleState): RickToxicoAI {
  if (!npc.ai) npc.ai = {};
  npc.ai.rickToxico ??= {
    nextFlask: "pinkFlask",
    lastThrow: 0,
    smokeX: 0,
    smokeUntil: 0,
    lastSmokeTick: 0,
  };
  return npc.ai.rickToxico;
}

/**
 * Abre a nuvem de fumaça onde o frasco quebrou. Chamado pelo `useAi` no
 * acerto do projétil, porque só o pipeline de projétil sabe *onde* e *quando*
 * o frasco atingiu o jogador — o `execute` só vê o projétil sumir.
 */
export function startRickToxicoSmoke(npc: NPCBattleState, x: number): void {
  const ai = ensureRickToxicoAI(npc);
  const now = Date.now();
  ai.smokeX = x;
  ai.smokeUntil = now + RICK_SMOKE_DURATION_MS;
  ai.lastSmokeTick = now;
}

/**
 * Rick Tóxico (issue #458): atirador que joga frascos alternando rosa e
 * amarelo. O frasco que acerta pode envenenar (resolvido no `useAi`) e deixa
 * uma fumaça que dá ticks pequenos enquanto o jogador ficar dentro dela.
 *
 * Os ticks passam pelo `onMeleeHit` com multiplicador baixo para continuarem
 * no funil único de dano (armadura + elemento), em vez de abrir um caminho
 * de dano próprio.
 *
 * Habilidade 1 (summon dos 5 bichos), Habilidade 2 (Morty com laser) e a
 * Expansão de Domínio ainda não estão aqui — ficam para PR seguinte.
 */
export class RickToxicoAttack extends NpcAttack {
  constructor() {
    super("rickToxico");
  }

  execute(ctx: BehaviorContext): BehaviorResult {
    const {
      npc,
      targetX,
      targetY,
      playerX,
      playerY,
      projectile,
      setProjectile,
      lastAttackRef,
      setForceIdle,
      onMeleeHit,
    } = ctx;

    const now = Date.now();
    const ai = ensureRickToxicoAI(npc);

    this.tickSmoke(ai, now, targetX, onMeleeHit);

    const threw = tryThrowProjectile({
      projectile,
      cooldown: NPC_PROJECTILE_COOLDOWN,
      lastAttackRef,
      setProjectile,
      projectileData: createCommonProjectile({
        startX: npc.x,
        startY: npc.y - 150,
        targetX: playerX,
        targetY: playerY - 150,
        sprite: ai.nextFlask,
        state: "walk",
        damageType: FLASK_DAMAGE_KIND,
      }),
      setForceIdle,
      idleDuration: THROW_IDLE_DURATION,
    });

    if (threw) {
      ai.lastThrow = now;
      ai.nextFlask = ai.nextFlask === "pinkFlask" ? "yellowFlask" : "pinkFlask";
    }

    if (projectile || now - ai.lastThrow < THROW_IDLE_DURATION) {
      return { x: npc.x, y: npc.y, state: "rangedAttack" as const };
    }

    if (Math.abs(npc.x - targetX) <= PREFERRED_RANGE) {
      return { x: npc.x, y: npc.y };
    }

    const { x } = chasePlayer(npc, targetX, targetY, 1, PREFERRED_RANGE);
    return { x, y: npc.y };
  }

  /**
   * Aplica um tick da fumaça quando o intervalo venceu e o alvo continua na
   * faixa da nuvem. O tick é consumido mesmo com o alvo fora, para quem volta
   * à fumaça não receber os ticks acumulados de uma vez.
   */
  private tickSmoke(
    ai: RickToxicoAI,
    now: number,
    targetX: number,
    onMeleeHit: BehaviorContext["onMeleeHit"],
  ): void {
    if (now >= ai.smokeUntil) return;
    if (now - ai.lastSmokeTick < RICK_SMOKE_TICK_MS) return;
    ai.lastSmokeTick = now;
    if (Math.abs(targetX - ai.smokeX) > RICK_SMOKE_RADIUS) return;
    onMeleeHit(RICK_SMOKE_TICK_MULTIPLIER, FLASK_DAMAGE_KIND);
  }
}
