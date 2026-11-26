import { NpcAttack } from "@/services/npc/npcAttack";

import { NPC_MELEE_COOLDOWN } from "@/data/cooldowns";
import {
  EIGHT_HUNDRED_MS,
  EIGHT_THOUSAND_MS,
  FIVE_THOUSAND_MS,
  ONE_THOUSAND_MS,
  TEN_THOUSAND_MS,
} from "@/data/ms";
import { ProjectileHpConstants } from "@/data/projectile";
import { chasePlayer } from "@/gameRules/npc/movement";
import { tryMeleeAttack } from "@/gameRules/npc/attack";
import { tryThrowProjectile } from "@/gameRules/npc/projectile";
import { createCommonProjectile } from "@/gameRules/npc/projectile/directionalProjectile";
import type {
  BehaviorContext,
  BehaviorResult,
} from "@/utils/types/npc/npcBehavior";
import type { NPCBattleState } from "@/utils/types/npc/npc";

/**
 * Estado da IA do Neimito, guardado em `npc.ai.neimito`.
 *
 * Os golpes especiais (gravidade e CLT) têm cooldown próprio, separado do
 * `lastAttackRef`, porque o `lastAttackRef` é compartilhado entre melee e a
 * pedra: se a gravidade consumisse esse ref, ela empurraria a pedra para
 * depois e o Neimito viraria um NPC só de debuff.
 */
export type NeimitoAI = {
  lastGravity: number;
  lastClt: number;
  /** Fim da animação do golpe especial atual (0 = nenhum em curso). */
  actionUntil: number;
  actionState: NPCBattleState["state"];
};

const MELEE_RANGE = 50;

/**
 * Controle da gravidade: deixa o jogador lento. Reusa o status `paralyze`,
 * que já corta a velocidade de andar pela metade (`getStep`) — é exatamente
 * a "lentidão" pedida na issue, sem criar um status paralelo.
 * Decisão para revisar: cooldown de 8s.
 */
const GRAVITY_COOLDOWN = EIGHT_THOUSAND_MS;

/**
 * CLT: "Vocês estão com sono por que? Vocês não trabalham!". Deixa o
 * personagem dormindo via `freeze` (imobiliza por completo, duração padrão
 * de `STATUS_DURATIONS_MS.freeze`). Só sai de perto para o jogador ter como
 * fugir do golpe mantendo distância.
 * Decisão para revisar: cooldown de 10s, alcance de 140px e status `freeze`
 * no lugar de um status `sleep` dedicado.
 */
const CLT_COOLDOWN = TEN_THOUSAND_MS;
const CLT_RANGE = 140;

/**
 * Pedra "que vai daqui em Picos": projétil grande, físico, que não dá para
 * desviar agachando (é larga demais) e aguenta o dobro de golpes de um
 * projétil comum antes de quebrar.
 * Decisão para revisar: cooldown de 5s e HP 2x o padrão.
 */
const ROCK_COOLDOWN = FIVE_THOUSAND_MS;
const ROCK_HP = ProjectileHpConstants.DEFAULT_HP * 2;
const ROCK_IDLE_DURATION = ONE_THOUSAND_MS;
const ROCK_SPRITE = "neimitoRock";
const ROCK_HEIGHT_OFFSET = 150;

/** Duração em que o sprite do golpe especial fica na tela. */
const SPECIAL_ACTION_DURATION = EIGHT_HUNDRED_MS;

/**
 * Neimito, o mestre do calor (issue #289). Primeira fatia da luta: os três
 * golpes de controle da fase 1 (gravidade, pedra e CLT) mais o melee padrão.
 * Molas, pedras flutuantes, pisão e o kaioken da fase 2 ficam para depois.
 *
 * Prioridade a cada tick: termina a animação do especial em curso → CLT
 * (perto) → gravidade → melee → pedra → persegue. Os debuffs vêm antes do
 * dano porque é deles que a luta tira identidade.
 */
export class NeimitoAttack extends NpcAttack {
  constructor() {
    super("neimito");
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
      onApplyDebuff,
    } = ctx;

    const now = Date.now();
    const ai = this.getAi(npc, now);

    if (now < ai.actionUntil) {
      return { x: npc.x, y: npc.y, state: ai.actionState };
    }

    const distanceX = Math.abs(npc.x - targetX);

    if (distanceX <= CLT_RANGE && now - ai.lastClt >= CLT_COOLDOWN) {
      ai.lastClt = now;
      onApplyDebuff?.("freeze");
      return this.startAction(npc, ai, now, "invoking");
    }

    if (now - ai.lastGravity >= GRAVITY_COOLDOWN) {
      ai.lastGravity = now;
      onApplyDebuff?.("paralyze");
      return this.startAction(npc, ai, now, "debuff");
    }

    if (distanceX <= MELEE_RANGE) {
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
      if (hit) return { x: npc.x, y: npc.y, state: "meleeAttack" };
      return { x: npc.x, y: npc.y };
    }

    const threw = tryThrowProjectile({
      projectile,
      cooldown: ROCK_COOLDOWN,
      lastAttackRef,
      setProjectile,
      projectileData: createCommonProjectile({
        startX: npc.x,
        startY: npc.y - ROCK_HEIGHT_OFFSET,
        targetX: playerX,
        targetY: playerY - ROCK_HEIGHT_OFFSET,
        sprite: ROCK_SPRITE,
        state: "walk",
        canCrouchDodge: false,
        hp: ROCK_HP,
        damageType: "physical",
      }),
      setForceIdle,
      idleDuration: ROCK_IDLE_DURATION,
    });

    if (threw || projectile) {
      return { x: npc.x, y: npc.y, state: "rangedAttack" };
    }

    const { x } = chasePlayer(npc, targetX, targetY, 1, MELEE_RANGE);
    return { x, y: npc.y, state: "walk" };
  }

  /**
   * Inicializa o estado com os cooldowns "recém usados", para o jogador ter
   * uma janela no começo da luta antes do primeiro debuff.
   */
  private getAi(npc: NPCBattleState, now: number): NeimitoAI {
    npc.ai ??= {};
    npc.ai.neimito ??= {
      lastGravity: now,
      lastClt: now,
      actionUntil: 0,
      actionState: "idle",
    };
    return npc.ai.neimito;
  }

  private startAction(
    npc: NPCBattleState,
    ai: NeimitoAI,
    now: number,
    state: NPCBattleState["state"],
  ): BehaviorResult {
    ai.actionUntil = now + SPECIAL_ACTION_DURATION;
    ai.actionState = state;
    return { x: npc.x, y: npc.y, state };
  }
}
