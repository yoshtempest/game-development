import type { BabidiToxicFormApi, Props } from "./types";
import { useCallback, useEffect, useRef, useState } from "react";

import { useLatestRef } from "@/hooks/useLatestRef";
import { useSkillGuard } from "@/hooks/battle/player/characters/skillGuard/useSkillGuard";
import {
  ABILITY_COOLDOWN_TICK_MS,
  useCooldownPauseTick,
} from "@/hooks/battle/utilities/useCooldowns";

import { applyCooldownReduction } from "@/gameRules/battle/cooldownReduction";
import { BabidiToxicFormConstants } from "@/data/characters/babidi";

/**
 * Modo Tóxico do babidi (issue #438): transformação ativa com custo, duração
 * e cooldown.
 *
 * A forma em si não causa dano: ela só liga o roll de veneno do ataque básico
 * (`onMainBasicHit`), chamado pelo caller no impacto do projétil. Assim o
 * dano continua passando pelo funil único (`playerHit`) e o veneno pelo status
 * de NPC já existente — a forma não abre um caminho de dano paralelo.
 *
 * Duração e cooldown são deadlines de `Date.now()` e ambos são empurrados
 * durante a pausa (`useCooldownPauseTick`), senão abrir o menu consumiria a
 * transformação com a batalha parada.
 *
 * Com o Machine Gama sob controle (`blocked`) a forma fica suspensa: o sprite
 * do babidi some e o básico passa a ser do Machine Gama, que não herda o
 * veneno. O relógio da duração segue correndo — a forma não é "guardada".
 */
export function useBabidiToxicForm({
  player,
  battleManaRef,
  freezeActionsUntilRef,
  isPausedRef,
  disabledRef,
  battleEndedRef,
  blocked,
  onUsed,
  onPoison,
  cooldownReduction,
}: Props): BabidiToxicFormApi {
  const [active, setActive] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const activeRef = useRef(false);
  const activeUntilRef = useRef(0);
  const readyAtRef = useRef(0);

  const onUsedRef = useLatestRef(onUsed);
  const onPoisonRef = useLatestRef(onPoison);
  const blockedRef = useLatestRef(blocked);

  const cost = Math.ceil(
    (battleManaRef.current?.playerMaxMana ?? 0) *
      BabidiToxicFormConstants.COST_RATIO,
  );

  const { usable, usableRef } = useSkillGuard({
    player,
    character: "babidi",
    freezeActionsUntilRef,
    disabledRef,
    isPausedRef,
    battleEndedRef,
    extraCanUse: () => !blockedRef.current,
    extraUsable: () =>
      Date.now() >= readyAtRef.current &&
      !activeRef.current &&
      (battleManaRef.current?.playerMana ?? 0) >=
        Math.ceil(
          (battleManaRef.current?.playerMaxMana ?? 0) *
            BabidiToxicFormConstants.COST_RATIO,
        ),
  });

  const setActiveState = useCallback((next: boolean) => {
    activeRef.current = next;
    setActive(next);
  }, []);

  const press = useCallback(() => {
    if (!usableRef.current || activeRef.current) return;
    if (Date.now() < readyAtRef.current) return;

    const mana = battleManaRef.current;
    if (!mana) return;
    const spend = Math.ceil(
      mana.playerMaxMana * BabidiToxicFormConstants.COST_RATIO,
    );
    if (spend > 0 && !mana.consumeMana(spend)) return;

    const now = Date.now();
    const cooldownMs = applyCooldownReduction(
      BabidiToxicFormConstants.COOLDOWN_MS,
      cooldownReduction,
    );
    readyAtRef.current = now + cooldownMs;
    activeUntilRef.current = now + BabidiToxicFormConstants.DURATION_MS;
    setRemaining(cooldownMs / 1000);
    setActiveState(true);
    onUsedRef.current();
  }, [usableRef, battleManaRef, cooldownReduction, setActiveState, onUsedRef]);

  const onMainBasicHit = useCallback(() => {
    if (!activeRef.current || blockedRef.current) return;
    if (Math.random() >= BabidiToxicFormConstants.POISON_CHANCE) return;
    onPoisonRef.current();
  }, [onPoisonRef, blockedRef]);

  const cooldownTick = useCooldownPauseTick({ readyAtRef, isPausedRef });
  const durationTick = useCooldownPauseTick({
    readyAtRef: activeUntilRef,
    isPausedRef,
  });

  useEffect(() => {
    const id = setInterval(() => {
      const durationRunning = durationTick();
      if (
        durationRunning &&
        activeRef.current &&
        Date.now() >= activeUntilRef.current
      ) {
        setActiveState(false);
      }
      if (!cooldownTick()) return;
      const next = Math.max(0, (readyAtRef.current - Date.now()) / 1000);
      setRemaining((prev) => (prev === next ? prev : next));
    }, ABILITY_COOLDOWN_TICK_MS);
    return () => clearInterval(id);
  }, [cooldownTick, durationTick, setActiveState]);

  return {
    active: active && !blocked,
    press,
    usable: usable && !active && remaining <= 0,
    remaining,
    cost,
    onMainBasicHit,
  };
}
