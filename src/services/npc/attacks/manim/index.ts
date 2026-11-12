import { NpcAttack } from "@/services/npc/npcAttack";
import { NPC_MELEE_COOLDOWN } from "@/data/cooldowns";
import { chasePlayer } from "@/gameRules/npc/movement";
import { tryMeleeAttack } from "@/gameRules/npc/attack";
import { clampX } from "@/gameRules/movement/clampX";
import { createCommonProjectile } from "@/gameRules/npc/projectile/directionalProjectile";

import {
  ATOM_CHASE_SPEED,
  ATOM_DURATION,
  ATOM_KICK_INTERVAL,
  ATOM_KICK_MULTIPLIER,
  ATOM_REAPPLY_AT,
  ATOM_STATUS,
  MANIM_MELEE_RANGE,
  MANIM_MOVE_COOLDOWN,
  MANIM_MOVE_ROTATION,
  NUKE_TRIGGER_MS,
  NUKE_WINDUP,
  POTION_COMBINE_DURATION,
  POTION_HIT_RADIUS_X,
  POTION_SPAWN_GRACE,
  POTION_STATUSES,
  POTIONS_PER_MOVE,
  PROBLEM_DURATION,
  PROBLEM_TICK_DAMAGE,
  PROBLEM_TICK_MS,
  TA_BOM_BASE_DAMAGE,
  TA_BOM_BASE_PUSH,
  TA_BOM_DAMAGE_STEP,
  TA_BOM_INTERVAL,
  TA_BOM_PUSH_STEP,
  TA_BOM_REPEATS,
  initManimAi,
} from "./state";

import type { ManimAI, ManimMove } from "./state";
import type {
  BehaviorContext,
  BehaviorResult,
} from "@/utils/types/npc/npcBehavior";

const POTION_SPRITE = "manimPotion";

/**
 * Manim, o professor de química (issue #292).
 *
 * Persegue e dá melee entre os golpes; a cada `MANIM_MOVE_COOLDOWN` entra no
 * próximo golpe da rotação (`MANIM_MOVE_ROTATION`). Independente da rotação,
 * ao completar `NUKE_TRIGGER_MS` de batalha ele interrompe o que estiver
 * fazendo e solta as bombas, que matam o jogador.
 *
 * Todo dano passa pelos funis do `useNpcAI` (`onMeleeHit`, `onFixedHit`,
 * `onExecutePlayer`) e todo status por `onApplyDebuff` → `applyPlayerStatus`,
 * para co-op e armadura enxergarem os golpes como qualquer outro.
 */
export class ManimAttack extends NpcAttack {
  constructor() {
    super("manim");
  }

  execute(ctx: BehaviorContext): BehaviorResult {
    const { npc } = ctx;
    const now = Date.now();

    if (!npc.ai) npc.ai = {};
    if (!npc.ai.manim) npc.ai.manim = initManimAi(now);
    const ai = npc.ai.manim;

    if (ai.move !== "nuke" && now - ai.battleStart >= NUKE_TRIGGER_MS) {
      this.startMove(ai, "nuke", now);
    }

    switch (ai.move) {
      case "nuke":
        return this.nuke(ai, ctx, now);
      case "atom":
        return this.atom(ai, ctx, now);
      case "potion":
        return this.potion(ai, ctx, now);
      case "problem":
        return this.problem(ai, ctx, now);
      case "taBom":
        return this.taBom(ai, ctx, now);
      case "chase":
        return this.chase(ai, ctx, now);
    }
  }

  private startMove(ai: ManimAI, move: ManimAI["move"], now: number): void {
    ai.move = move;
    ai.moveStart = now;
    ai.atomReapplied = false;
    ai.lastKick = 0;
    ai.potionsLeft = POTIONS_PER_MOVE;
    ai.potionPhase = "combine";
    ai.potionNearPlayer = false;
    ai.lastCalcTick = now;
    ai.taBomCount = 0;
    ai.taBomLast = 0;
    ai.taBomDamage = TA_BOM_BASE_DAMAGE;
    ai.nukeDetonated = false;
  }

  private endMove(ai: ManimAI, now: number): void {
    ai.move = "chase";
    ai.moveStart = now;
    ai.lastMoveEnd = now;
  }

  private chase(
    ai: ManimAI,
    ctx: BehaviorContext,
    now: number,
  ): BehaviorResult {
    const { npc, targetX, targetY, lastAttackRef, onMeleeHit } = ctx;

    if (now - ai.lastMoveEnd >= MANIM_MOVE_COOLDOWN) {
      const next: ManimMove =
        MANIM_MOVE_ROTATION[ai.rotationIndex % MANIM_MOVE_ROTATION.length] ??
        "atom";
      ai.rotationIndex += 1;
      this.startMove(ai, next, now);
      return { x: npc.x, y: npc.y, state: "default" };
    }

    const { x } = chasePlayer(npc, targetX, targetY, 1, MANIM_MELEE_RANGE);
    const hit = tryMeleeAttack({
      npcX: npc.x,
      npcY: npc.y,
      playerX: targetX,
      playerY: targetY,
      range: MANIM_MELEE_RANGE,
      cooldown: NPC_MELEE_COOLDOWN,
      lastAttackRef,
      onHit: onMeleeHit,
    });

    return { x, y: npc.y, state: hit ? "meleeAttack" : "walk" };
  }

  /**
   * Comprime o jogador num átomo: a paralisia trava o input e o Manim corre
   * até ele chutando a cada `ATOM_KICK_INTERVAL` enquanto o átomo dura.
   */
  private atom(ai: ManimAI, ctx: BehaviorContext, now: number): BehaviorResult {
    const { npc, targetX, targetY, onApplyDebuff, onMeleeHit } = ctx;
    const elapsed = now - ai.moveStart;

    if (ai.lastKick === 0) {
      onApplyDebuff?.(ATOM_STATUS);
      ai.lastKick = now - ATOM_KICK_INTERVAL;
      return { x: npc.x, y: npc.y, state: "compress" };
    }

    if (!ai.atomReapplied && elapsed >= ATOM_REAPPLY_AT) {
      ai.atomReapplied = true;
      onApplyDebuff?.(ATOM_STATUS);
    }

    if (elapsed >= ATOM_DURATION) {
      this.endMove(ai, now);
      return { x: npc.x, y: npc.y, state: "default" };
    }

    const distance = Math.abs(npc.x - targetX);
    if (distance > MANIM_MELEE_RANGE) {
      const { x } = chasePlayer(
        npc,
        targetX,
        targetY,
        ATOM_CHASE_SPEED,
        MANIM_MELEE_RANGE,
      );
      return { x, y: npc.y, state: "run" };
    }

    if (now - ai.lastKick >= ATOM_KICK_INTERVAL) {
      ai.lastKick = now;
      onMeleeHit(ATOM_KICK_MULTIPLIER);
    }

    return { x: npc.x, y: npc.y, state: "kick" };
  }

  /**
   * Combina elementos e arremessa uma poção por vez. O projétil comum não
   * carrega status, então o golpe observa a poção: se ela some enquanto está
   * sobre o jogador, conta como acerto e o status sorteado no arremesso é
   * aplicado. `POTION_SPAWN_GRACE` cobre o tick em que o `setProjectile`
   * ainda não chegou ao `projectile` do contexto.
   */
  private potion(
    ai: ManimAI,
    ctx: BehaviorContext,
    now: number,
  ): BehaviorResult {
    const { npc, projectile, setProjectile, playerX, playerY, onApplyDebuff } =
      ctx;

    if (ai.potionPhase === "flying") {
      if (now - ai.moveStart < POTION_SPAWN_GRACE) {
        return { x: npc.x, y: npc.y, state: "throw" };
      }
      if (projectile && projectile.sprite === POTION_SPRITE) {
        ai.potionNearPlayer =
          Math.abs(projectile.x - playerX) <= POTION_HIT_RADIUS_X;
        return { x: npc.x, y: npc.y, state: "throw" };
      }

      if (ai.potionNearPlayer) onApplyDebuff?.(ai.potionStatus);
      ai.potionNearPlayer = false;

      if (ai.potionsLeft <= 0) {
        this.endMove(ai, now);
        return { x: npc.x, y: npc.y, state: "default" };
      }
      ai.potionPhase = "combine";
      ai.moveStart = now;
    }

    if (now - ai.moveStart < POTION_COMBINE_DURATION || projectile) {
      return { x: npc.x, y: npc.y, state: "combine" };
    }

    ai.potionStatus =
      POTION_STATUSES[Math.floor(Math.random() * POTION_STATUSES.length)] ??
      "poison";
    ai.potionsLeft -= 1;
    ai.potionPhase = "flying";
    ai.moveStart = now;
    const facing = playerX >= npc.x ? 1 : -1;
    setProjectile(
      createCommonProjectile({
        startX: npc.x + facing * 40,
        startY: npc.y - 150,
        targetX: playerX,
        targetY: playerY - 150,
        sprite: POTION_SPRITE,
        state: "walk",
        damageType: "magical",
      }),
    );
    return { x: npc.x, y: npc.y, state: "throw" };
  }

  /**
   * "Isso é problema minha gente": por `PROBLEM_DURATION` acumula ticks de
   * `PROBLEM_TICK_MS` e cobra os que caíram enquanto o jogador não bloqueava.
   * Acumular (em vez de 1 tick por frame) mantém os 20 de dano/s mesmo que o
   * loop da IA rode mais devagar que 50ms.
   */
  private problem(
    ai: ManimAI,
    ctx: BehaviorContext,
    now: number,
  ): BehaviorResult {
    const { npc, playerState, onFixedHit } = ctx;

    const ticks = Math.floor((now - ai.lastCalcTick) / PROBLEM_TICK_MS);
    if (ticks > 0) {
      ai.lastCalcTick += ticks * PROBLEM_TICK_MS;
      if (playerState !== "blocked") {
        onFixedHit?.(ticks * PROBLEM_TICK_DAMAGE);
      }
    }

    if (now - ai.moveStart >= PROBLEM_DURATION) {
      this.endMove(ai, now);
      return { x: npc.x, y: npc.y, state: "default" };
    }

    return { x: npc.x, y: npc.y, state: "problem" };
  }

  /**
   * "Tá bom?" `TA_BOM_REPEATS` vezes: o texto cresce e empurra sempre; o dano
   * só sobe (+`TA_BOM_DAMAGE_STEP`) quando o jogador sofreu a instância
   * anterior, como pede a issue — bloquear segura o escalonamento.
   */
  private taBom(
    ai: ManimAI,
    ctx: BehaviorContext,
    now: number,
  ): BehaviorResult {
    const { npc, targetX, playerState, onFixedHit, onRamPushPlayer } = ctx;

    if (ai.taBomCount >= TA_BOM_REPEATS) {
      if (now - ai.taBomLast >= TA_BOM_INTERVAL) {
        this.endMove(ai, now);
        return { x: npc.x, y: npc.y, state: "default" };
      }
      return { x: npc.x, y: npc.y, state: "taBom" };
    }

    if (ai.taBomLast === 0 || now - ai.taBomLast >= TA_BOM_INTERVAL) {
      ai.taBomLast = now;
      const push = TA_BOM_BASE_PUSH + TA_BOM_PUSH_STEP * ai.taBomCount;
      ai.taBomCount += 1;

      const away = targetX >= npc.x ? 1 : -1;
      const facing = away === 1 ? "left" : "right";
      onRamPushPlayer?.(facing, clampX(targetX + away * push));

      if (playerState !== "blocked") {
        onFixedHit?.(ai.taBomDamage);
        ai.taBomDamage += TA_BOM_DAMAGE_STEP;
      }
    }

    return { x: npc.x, y: npc.y, state: "taBom" };
  }

  /**
   * "Hiroshima + Nagasaki": depois do windup das duas bombas se juntando, o
   * clarão executa o jogador. O relógio reinicia para o caso de algo o salvar
   * do golpe letal (ex.: sobreviver a um hit letal), e o Manim volta a lutar.
   */
  private nuke(ai: ManimAI, ctx: BehaviorContext, now: number): BehaviorResult {
    const { npc, onExecutePlayer } = ctx;

    if (!ai.nukeDetonated && now - ai.moveStart >= NUKE_WINDUP) {
      ai.nukeDetonated = true;
      onExecutePlayer?.();
      ai.battleStart = now;
      this.endMove(ai, now);
      return { x: npc.x, y: npc.y, state: "default" };
    }

    return { x: npc.x, y: npc.y, state: "nuke" };
  }
}
