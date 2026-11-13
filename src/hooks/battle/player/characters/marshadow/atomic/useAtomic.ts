import type { Props, AtomicApi } from "./types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import {
  ATOMIC_COOLDOWN_MS,
  ATOMIC_REIRYOKU_COST,
} from "@/data/characters/marshadow/marshadow";
import { applyCooldownReduction } from "@/gameRules/battle/cooldownReduction";
import {
  ONE_HUNDRED_MS,
  TWO_HUNDRED_MS,
  FOUR_HUNDRED_FIFTY_MS,
  ONE_THOUSAND_MS,
} from "@/data/ms";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import { useSkillGuard } from "@/hooks/battle/player/characters/skillGuard/useSkillGuard";
import { useMenuPause } from "@/hooks/battle/utilities/useMenuPause";
import { usePausableTimers } from "@/hooks/battle/utilities/pausableTimers/usePausableTimers";
import {
  ABILITY_COOLDOWN_TICK_MS,
  useCooldownPauseTick,
} from "@/hooks/battle/utilities/useCooldowns";
import { getProjectileCenter } from "@/gameRules/npc/projectile/projectileDamage";
import type { AtomicCut, AtomicExplosion } from "@/utils/types/battle/atomic";

/** Raio da explosão (px lógicos) a partir do inimigo com maior vida máxima. */
export const ATOMIC_RADIUS = 300;
/** Fase "starting" (sprite starting.svg via preAtomic): 100ms. */
export const ATOMIC_STARTING_MS = ONE_HUNDRED_MS;
/** Fase "preparing" (sprite preparing.svg + halo): 450ms. */
export const ATOMIC_PREPARING_MS = FOUR_HUNDRED_FIFTY_MS;
/** Tempo após o finalizating.svg até a explosion.svg explodir: 100ms. */
export const ATOMIC_EXPLOSION_DELAY_MS = ONE_HUNDRED_MS;
/** Duração do CutInEnemie sobre os inimigos atingidos. */
export const ATOMIC_CUT_DURATION_MS = TWO_HUNDRED_MS;
/** Animação total (1s) — casa com a duração do specialIntro (1s). */
export const ATOMIC_TOTAL_DURATION_MS = ONE_THOUSAND_MS;
/** Multiplicador do dano especial no alvo (inimigo com maior vida máxima). */
export const ATOMIC_TARGET_MULTIPLIER = 2;
/** Multiplicador do dano especial nos demais inimigos dentro do raio. */
export const ATOMIC_AREA_MULTIPLIER = 1;

/**
 * "I Am Atomic" do marshadow: o jogador dispara a sequência starting.svg →
 * preparing.svg → finalizating.svg (todas sob o background do specialIntro e
 * com o halo acima do sprite), centra a explosion.svg no inimigo com maior
 * vida máxima e, 100ms depois da troca para finalizating.svg, causa dano em
 * TODOS os inimigos em um raio de 300px (2x no alvo, 1x nos demais) junto com
 * um CutInEnemie (chance de sangrar no NPC principal). Cooldown de 20s.
 *
 * A coreografia inteira roda em timers pausáveis: com o menu aberto cada fase
 * congela com o tempo restante e o halo/explosão continuam na tela; no unpause
 * a sequência retoma de onde parou e o golpe acerta. Antes os timers corriam
 * dentro do menu e a limpeza no fim apagava a explosão sem dano aplicado.
 */
export function useAtomic({
  player,
  setPlayer,
  npc,
  npcType,
  npcMaxHp,
  npcHp,
  summons,
  projectiles,
  startSpecialIntro,
  onBoom,
  onNpcCutInRef,
  freezeActionsUntilRef,
  isPausedRef,
  battleEndedRef,
  disabledRef,
  playSound,
  onUsed,
  cooldownReduction,
  energy,
  spendEnergy,
}: Props): AtomicApi {
  const [halo, setHalo] = useState(false);
  const [explosion, setExplosion] = useState<AtomicExplosion | null>(null);
  const [cuts, setCuts] = useState<AtomicCut[]>([]);
  const [flash, setFlash] = useState(false);
  const [remaining, setRemaining] = useState(0);

  const activeRef = useRef(false);
  const readyAtRef = useRef(0);
  const cooldownReductionRef = useLatestRef(cooldownReduction);
  const cutKeyRef = useRef(0);
  const targetRef = useRef<{
    id: string;
    x: number;
    y: number;
    npcType: string;
  } | null>(null);
  const { isMenuOpen } = useMenuPause();
  const timers = usePausableTimers(isMenuOpen);

  const npcRef = useLatestRef(npc);
  const npcTypeRef = useLatestRef(npcType);
  const npcMaxHpRef = useLatestRef(npcMaxHp);
  const npcHpRef = useLatestRef(npcHp);
  const summonsRef = useLatestRef(summons);
  const projectilesRef = useLatestRef(projectiles);
  const onBoomRef = useLatestRef(onBoom);
  const onUsedRef = useLatestRef(onUsed);
  const spendEnergyRef = useLatestRef(spendEnergy);

  const { usable, usableRef, shouldCancelRef } = useSkillGuard({
    player,
    character: "marshadow",
    freezeActionsUntilRef,
    disabledRef,
    isPausedRef,
    battleEndedRef,
    extraCanUse: () =>
      readyAtRef.current <= Date.now() &&
      !activeRef.current &&
      (energy ?? ATOMIC_REIRYOKU_COST) >= ATOMIC_REIRYOKU_COST,
    extraCancel: () => !activeRef.current,
  });

  const clearTimers = useCallback(() => {
    timers.clear();
  }, [timers]);

  const cleanup = useCallback(() => {
    activeRef.current = false;
    clearTimers();
    setHalo(false);
    setExplosion(null);
    setFlash(false);
    setCuts([]);
    targetRef.current = null;
    setPlayer((p) =>
      p.mode !== "battle" || !ALL_PREDICATES.isAtomic(p.state)
        ? p
        : { ...p, state: "idle" },
    );
  }, [clearTimers, setPlayer]);

  const cleanupRef = useLatestRef(cleanup);

  /** Inimigo com a maior vida máxima — o alvo da explosão (2x de dano). */
  const findTarget = useCallback(() => {
    const enemies: {
      id: string;
      maxHp: number;
      x: number;
      y: number;
      npcType: string;
    }[] = [
      {
        id: "main",
        maxHp: npcMaxHpRef.current,
        x: npcRef.current.x,
        y: npcRef.current.y,
        npcType: npcTypeRef.current,
      },
      ...summonsRef.current.map((s) => ({
        id: s.id,
        maxHp: s.maxHp,
        x: s.x,
        y: s.y,
        npcType: s.npcType,
      })),
    ];
    let target = enemies[0] ?? {
      id: "main",
      maxHp: 0,
      x: npcRef.current.x,
      y: npcRef.current.y,
      npcType: npcTypeRef.current,
    };
    for (const enemy of enemies) {
      if (enemy.maxHp > target.maxHp) target = enemy;
    }
    return target;
  }, [npcTypeRef, npcRef, npcMaxHpRef, summonsRef]);

  const press = useCallback(() => {
    if (!usableRef.current) return;
    if (activeRef.current) return;
    if (!spendEnergyRef.current(ATOMIC_REIRYOKU_COST)) return;

    onUsedRef.current?.();
    activeRef.current = true;
    const cooldownMs = applyCooldownReduction(
      ATOMIC_COOLDOWN_MS,
      cooldownReductionRef.current,
    );
    readyAtRef.current = Date.now() + cooldownMs;
    setRemaining(cooldownMs / 1000);
    freezeActionsUntilRef.current = Math.max(
      freezeActionsUntilRef.current,
      Date.now() + ATOMIC_TOTAL_DURATION_MS,
    );
    setHalo(false);
    setExplosion(null);
    setFlash(false);
    setCuts([]);
    cutKeyRef.current = 0;
    targetRef.current = null;
    clearTimers();

    // O specialIntro (1s) exibe o background da habilidade por cima de tudo e
    // deixa o tempo em slow-motion; a coreografia roda em paralelo cobrindo o
    // mesmo 1s (starting → preparing → finalizating → explosion).
    startSpecialIntro("marshadow", () => {}, "atomic");

    const prepareAt = ATOMIC_STARTING_MS;
    const finalizeAt = ATOMIC_STARTING_MS + ATOMIC_PREPARING_MS;
    const explodeAt = finalizeAt + ATOMIC_EXPLOSION_DELAY_MS;

    timers.schedule(() => {
      if (shouldCancelRef.current()) {
        cleanupRef.current();
        return;
      }
      setPlayer((pp) =>
        pp.mode !== "battle" ? pp : { ...pp, state: "preparingAtomic" },
      );
      setHalo(true);
      playSound("preAtomic");
    }, prepareAt);

    timers.schedule(() => {
      if (shouldCancelRef.current()) {
        cleanupRef.current();
        return;
      }
      setPlayer((pp) =>
        pp.mode !== "battle" ? pp : { ...pp, state: "finalizatingAtomic" },
      );
      const target = findTarget();
      targetRef.current = target;
      setExplosion({
        x: target.x,
        y: target.y,
        npcType: target.npcType,
        phase: "starting",
      });
    }, finalizeAt);

    timers.schedule(() => {
      if (shouldCancelRef.current()) {
        cleanupRef.current();
        return;
      }
      const target = targetRef.current ?? findTarget();

      setExplosion((prev) => (prev ? { ...prev, phase: "explosion" } : prev));
      setFlash(true);
      playSound("atomic");

      // Inimigos atingidos: todos em um raio de 300px (eixos x/y) do alvo.
      const hitSummonIds: string[] = [];
      const hitMain =
        Math.abs(npcRef.current.x - target.x) <= ATOMIC_RADIUS &&
        Math.abs(npcRef.current.y - target.y) <= ATOMIC_RADIUS;

      for (const s of summonsRef.current) {
        if (
          Math.abs(s.x - target.x) > ATOMIC_RADIUS ||
          Math.abs(s.y - target.y) > ATOMIC_RADIUS
        ) {
          continue;
        }
        hitSummonIds.push(s.id);
        if (s.isDying || s.hp <= 0) continue;
        cutKeyRef.current += 1;
        const cutKey = cutKeyRef.current;
        setCuts((prev) => [
          ...prev,
          {
            key: cutKey,
            x: s.x,
            y: s.y,
            npcType: s.npcType,
            rotation: Math.random() * 90,
          },
        ]);
        timers.schedule(
          () => setCuts((prev) => prev.filter((c) => c.key !== cutKey)),
          ATOMIC_CUT_DURATION_MS,
        );
      }

      const hitProjectileIds = projectilesRef.current
        .filter((p) => {
          if (p.indestructible) return false;
          const center = getProjectileCenter(p);
          return (
            Math.abs(center.x - target.x) <= ATOMIC_RADIUS &&
            Math.abs(center.y - target.y) <= ATOMIC_RADIUS
          );
        })
        .map((p) => p.id);

      // NPC principal atingido: dano (via onBoom) + CutInEnemie com
      // chance de sangrar (mecânica padrão de ataque do marshadow).
      if (hitMain && npcHpRef.current > 0) {
        onNpcCutInRef.current?.();
      }

      onBoomRef.current({
        targetId: target.id,
        targetX: target.x,
        targetY: target.y,
        hitMain,
        hitSummonIds,
        hitProjectileIds,
      });
    }, explodeAt);

    timers.schedule(() => cleanupRef.current(), ATOMIC_TOTAL_DURATION_MS);
  }, [
    cleanupRef,
    clearTimers,
    cooldownReductionRef,
    findTarget,
    freezeActionsUntilRef,
    npcHpRef,
    npcRef,
    onNpcCutInRef,
    onBoomRef,
    onUsedRef,
    playSound,
    projectilesRef,
    setPlayer,
    shouldCancelRef,
    startSpecialIntro,
    summonsRef,
    timers,
    usableRef,
    spendEnergyRef,
  ]);

  // Tick do cooldown restante do botão (20s). Com o menu de batalha aberto o
  // cooldown congela: a batalha pausada não regenera habilidade.
  const cooldownTick = useCooldownPauseTick({ readyAtRef, isPausedRef });

  useEffect(() => {
    const id = setInterval(() => {
      if (!cooldownTick()) return;
      setRemaining(Math.max(0, (readyAtRef.current - Date.now()) / 1000));
    }, ABILITY_COOLDOWN_TICK_MS);
    return () => clearInterval(id);
  }, [cooldownTick]);

  useEffect(() => {
    return () => {
      clearTimers();
      activeRef.current = false;
    };
  }, [clearTimers]);

  return {
    halo,
    explosion,
    cuts,
    flash,
    press,
    usable,
    remaining,
  };
}
