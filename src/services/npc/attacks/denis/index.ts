import { NPC_MELEE_COOLDOWN } from "@/data/cooldowns";
import { chasePlayer } from "@/gameRules/npc/movement";
import { tryMeleeAttack } from "@/gameRules/npc/attack";
import { NpcAttack } from "@/services/npc/npcAttack";
import type {
  BehaviorContext,
  BehaviorResult,
} from "@/utils/types/npc/npcBehavior";
import type { DenisAI } from "./state";
import {
  DENIS_DOMAIN_CANCEL_MESSAGE,
  DENIS_DOMAIN_CAST_MS,
  DENIS_DOMAIN_HP_THRESHOLD,
  DENIS_IGNITE_MS,
  DENIS_MELEE_RANGE,
  DENIS_SHOT_COOLDOWN,
  DENIS_SHOT_MIN_RANGE,
  DENIS_SHOT_WINDUP_MS,
  initDenisAi,
} from "./state";
import { createDenisLead } from "./pistol";

/**
 * Denis (#301): incendeia a diretoria, atira chumbo explosivo e carboniza
 * quem encosta nele.
 *
 * O fogo da arena (1% da vida máxima por segundo) **não** está aqui: é perigo
 * do mapa, roda em `useArenaBurnTicks` a partir de `ARENA_BURN_FRACTION`, e
 * continua queimando mesmo enquanto ele está parado conjurando.
 */
export class DenisAttack extends NpcAttack {
  constructor() {
    super("denis");
  }

  execute(ctx: BehaviorContext): BehaviorResult {
    const { npc } = ctx;
    const now = Date.now();

    if (!npc.ai) npc.ai = {};
    if (!npc.ai.denis) npc.ai.denis = initDenisAi(now);
    const ai = npc.ai.denis;

    if (ai.phase === "ignite") return igniteDocuments(ctx, ai, now);
    if (ai.phase === "domain") return castCancelledDomain(ctx, ai, now);

    if (shouldAttemptDomain(ctx, ai)) {
      ai.domainAttempted = true;
      ai.phase = "domain";
      ai.phaseStartedAt = now;
      ai.shotState = "idle";
      return { x: npc.x, y: npc.y, state: "charging" };
    }

    return fight(ctx, ai, now);
  }
}

/**
 * Abertura: ele fica parado ateando fogo nos documentos. O jogador já pode
 * agir — a arena queima desde o primeiro segundo — e a abertura é a janela
 * para se posicionar antes do primeiro tiro.
 */
function igniteDocuments(
  ctx: BehaviorContext,
  ai: DenisAI,
  now: number,
): BehaviorResult {
  const { npc } = ctx;
  if (now - ai.phaseStartedAt < DENIS_IGNITE_MS) {
    return { x: npc.x, y: npc.y, state: "invoking" };
  }
  ai.phase = "fight";
  ai.phaseStartedAt = now;
  ai.lastShot = now;
  return { x: npc.x, y: npc.y, state: "idle" };
}

function shouldAttemptDomain(ctx: BehaviorContext, ai: DenisAI): boolean {
  if (ai.domainAttempted) return false;
  const hp = ctx.npcHp ?? 0;
  const maxHp = ctx.npcMaxHp ?? 1;
  return maxHp > 0 && hp > 0 && hp / maxHp <= DENIS_DOMAIN_HP_THRESHOLD;
}

/**
 * Ensaio da expansão de domínio: ele conjura parado por
 * `DENIS_DOMAIN_CAST_MS` e o Sistema cancela com a fala da issue. Não há
 * efeito de domínio nenhum — o cancelamento **é** a mecânica, e o tempo
 * parado conjurando é a recompensa de quem pune a abertura.
 */
function castCancelledDomain(
  ctx: BehaviorContext,
  ai: DenisAI,
  now: number,
): BehaviorResult {
  const { npc } = ctx;
  if (now - ai.phaseStartedAt < DENIS_DOMAIN_CAST_MS) {
    return { x: npc.x, y: npc.y, state: "charging" };
  }
  ctx.onSystemMessage?.(DENIS_DOMAIN_CANCEL_MESSAGE);
  ai.phase = "fight";
  ai.phaseStartedAt = now;
  ai.lastShot = now;
  return { x: npc.x, y: npc.y, state: "idle" };
}

/**
 * Luta normal: colado no jogador ele carboniza (melee mágico + `burn` via
 * `applyPlayerStatus`, pelo `onApplyDebuff`); a distância saca a pistola.
 * A mira (`aim`) existe para o tiro ter leitura antes de sair.
 */
function fight(
  ctx: BehaviorContext,
  ai: DenisAI,
  now: number,
): BehaviorResult {
  const {
    npc,
    targetX,
    targetY,
    lastAttackRef,
    onMeleeHit,
    projectile,
    setProjectile,
  } = ctx;
  const direction: "left" | "right" = targetX >= npc.x ? "right" : "left";

  if (ai.shotState === "aim") {
    if (now - ai.shotStartedAt < DENIS_SHOT_WINDUP_MS) {
      return { x: npc.x, y: npc.y, state: "rangedAttack", direction };
    }
    ai.shotState = "idle";
    ai.lastShot = now;
    if (!projectile) {
      setProjectile(createDenisLead(npc.x, npc.y, direction, now));
    }
    return { x: npc.x, y: npc.y, state: "rangedAttack", direction };
  }

  const touched = tryMeleeAttack({
    npcX: npc.x,
    npcY: npc.y,
    playerX: targetX,
    playerY: targetY,
    range: DENIS_MELEE_RANGE,
    cooldown: NPC_MELEE_COOLDOWN,
    lastAttackRef,
    onHit: onMeleeHit,
    damageKind: "magical",
  });
  if (touched) {
    ctx.onApplyDebuff?.("burn");
    return { x: npc.x, y: npc.y, state: "meleeAttack" };
  }

  const distance = Math.abs(targetX - npc.x);
  if (
    !projectile &&
    distance >= DENIS_SHOT_MIN_RANGE &&
    now - ai.lastShot >= DENIS_SHOT_COOLDOWN
  ) {
    ai.shotState = "aim";
    ai.shotStartedAt = now;
    return { x: npc.x, y: npc.y, state: "rangedAttack", direction };
  }

  const { x } = chasePlayer(npc, targetX, targetY, 1, DENIS_MELEE_RANGE);
  return { x, y: npc.y, state: "walk" };
}
