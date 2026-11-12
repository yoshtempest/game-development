import { BATTLE_LIMITS } from "@/gameRules/movement/constants";
import { chasePlayer } from "@/gameRules/npc/movement";
import { isNear } from "@/gameRules/npc/behavior";
import { clampX } from "@/gameRules/movement/clampX";
import type { BehaviorContext } from "@/utils/types/npc/npcBehavior";
import type { DeiseAI } from "./state";
import {
  DASH_CONTACT_RANGE,
  DASH_COOLDOWN,
  DASH_DAMAGE_INTERVAL_MS,
  DASH_DURATION_MS,
  DASH_MAX_TICK_GAP_MS,
  DASH_POST_IDLE_MS,
  DASH_PUSH_GAP,
  DASH_WIND_UP_MS,
} from "./state";

type Phase2Result = {
  x: number;
  y: number;
  state?: "idle" | "walk";
  direction?: "left" | "right";
};

function dashDirectionTo(playerX: number, npcX: number): "left" | "right" {
  return playerX >= npcX ? "right" : "left";
}

function dashToEnd(direction: "left" | "right"): number {
  return direction === "right" ? BATTLE_LIMITS.maxX : BATTLE_LIMITS.minX;
}

/**
 * Fase 2 da Deise: em vez de arremessar lanças, ela arranca em direção ao
 * jogador (dash) e atravessa a arena até a ponta oposta ao longo de
 * `DASH_DURATION_MS` (6s), usando a sprite `walk`. Enquanto corre surge uma
 * instância do efeito `four.svg` sobre ela, no lado para o qual está virada
 * (ver `DeiseDashAfterimage`). Em contato com o jogador ela causa dano a cada
 * `DASH_DAMAGE_INTERVAL_MS` e empurra/arrasta o jogador na frente dela pelo
 * caminho. O parry (block/attack 0-50ms antes do contato) evita o arrasto sem
 * interromper o dash: ela apenas segue a trajetória até a outra ponta — lá o
 * estado muda para `idle` (sem `direction`), e o `useNpcAI` a vira de volta ao
 * jogador. Ao chegar na outra ponta ela fica `DASH_POST_IDLE_MS` (3s) parada
 * sem atacar, dando ao jogador uma janela para causar dano.
 *
 * O trajeto avança por tick e de forma incremental a partir da posição atual:
 * o progresso soma só o tempo dos ticks em que a IA rodou (com teto de
 * `DASH_MAX_TICK_GAP_MS`) e cada tick anda a fração correspondente da
 * distância total. Com o progresso medido no relógio de parede e a posição
 * absoluta a partir de `dashStartX`, qualquer pausa da IA (menu, mundo
 * congelado por habilidade do jogador, sequência do O Abençoado, que ainda
 * afasta a Deise do jogador) fazia ela saltar direto para o ponto em que
 * "deveria" estar ao retomar.
 */
export function deisePhase2(ctx: BehaviorContext, ai: DeiseAI): Phase2Result {
  const {
    npc,
    targetX,
    targetY,
    playerX,
    playerY,
    onMeleeHit,
    isPlayerParrying,
    onRamPushPlayer,
    playSound,
  } = ctx;

  const now = Date.now();

  // ── windUp: arrancada anunciada antes de correr ──
  if (ai.dashState === "windUp") {
    if (now - ai.dashStart >= DASH_WIND_UP_MS) {
      ai.dashState = "dashing";
      ai.dashStart = now;
      ai.dashStartX = npc.x;
      ai.dashDirection = dashDirectionTo(targetX, npc.x);
      ai.dashEndX = dashToEnd(ai.dashDirection);
      ai.dashElapsed = 0;
      ai.lastDashTick = now;
      ai.lastDashDamage = now;
      playSound?.("whooshWind");
    }
    return { x: npc.x, y: npc.y, state: "idle" };
  }

  // ── dashing: cruza a arena em DASH_DURATION_MS até a ponta oposta ──
  if (ai.dashState === "dashing") {
    const tickMs = Math.min(
      Math.max(0, now - ai.lastDashTick),
      DASH_MAX_TICK_GAP_MS,
    );
    ai.lastDashTick = now;
    ai.dashElapsed += tickMs;
    const progress = Math.min(ai.dashElapsed / DASH_DURATION_MS, 1);
    const step = ((ai.dashEndX - ai.dashStartX) * tickMs) / DASH_DURATION_MS;
    const newX =
      ai.dashDirection === "right"
        ? Math.min(npc.x + step, ai.dashEndX)
        : Math.max(npc.x + step, ai.dashEndX);

    if (isNear(newX, npc.y, playerX, playerY, DASH_CONTACT_RANGE)) {
      // Parry abre caminho: sem parry a Deise arrasta o jogador à frente dela.
      const parrying = isPlayerParrying?.() ?? false;

      if (now - ai.lastDashDamage >= DASH_DAMAGE_INTERVAL_MS) {
        ai.lastDashDamage = now;
        playSound?.("impact", false);
        // Parry NÃO interrompe o dash: o `onMeleeHit` (que dispararia o
        // stagger do parry e travaria/teleportaria a trajetória) só roda
        // quando o jogador NÃO está com o parry no timing.
        if (!parrying) {
          onMeleeHit();
        }
      }

      if (!parrying) {
        const gap =
          ai.dashDirection === "right" ? DASH_PUSH_GAP : -DASH_PUSH_GAP;
        const pushX = clampX(newX + gap);
        onRamPushPlayer?.(ai.dashDirection, pushX);
      }
    }

    if (progress >= 1) {
      ai.dashState = "postDash";
      ai.postDashStart = now;
      ai.lastDash = now;
      // Sem direction no postDash: o useNpcAI calcula virada ao jogador.
      return { x: newX, y: npc.y, state: "idle" };
    }

    // Durante o dash não vira ao jogador ao atravessá-lo: mantém a direção
    // da corrida o trajeto inteiro (o afterimage acompanha a mesma direção).
    return {
      x: newX,
      y: npc.y,
      state: "walk",
      direction: ai.dashDirection,
    };
  }

  // ── postDash: ociosa depois de chegar na outra ponta ──
  if (ai.dashState === "postDash") {
    if (now - ai.postDashStart >= DASH_POST_IDLE_MS) {
      ai.dashState = "idle";
    }
    return { x: npc.x, y: npc.y, state: "idle" };
  }

  // ── idle: aguarda o cooldown e arranca de novo ──
  const dashReady = now - ai.lastDash >= DASH_COOLDOWN;
  if (dashReady) {
    ai.dashState = "windUp";
    ai.dashStart = now;
    return { x: npc.x, y: npc.y, state: "idle" };
  }

  const { x } = chasePlayer(npc, targetX, targetY, 1, 120);
  return { x, y: npc.y, state: "walk" };
}
