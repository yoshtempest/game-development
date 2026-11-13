import type { BankaiApi, Props } from "./types";
import { useCallback, useEffect, useRef, useState } from "react";

import { useLatestRef } from "@/hooks/useLatestRef";
import { useSkillGuard } from "@/hooks/battle/player/characters/skillGuard/useSkillGuard";
import {
  ABILITY_COOLDOWN_TICK_MS,
  useCooldownPauseTick,
} from "@/hooks/battle/utilities/useCooldowns";

import { applyCooldownReduction } from "@/gameRules/battle/cooldownReduction";

import {
  BANKAI_COOLDOWN_MS,
  BANKAI_DURATION_MS,
  BANKAI_RELEASE_LOCK_MS,
  BANKAI_TICK_MS,
} from "@/data/characters/marshadow/bankai";

/**
 * Bankai do marshadow (#424): liberação temporária que multiplica todo o dano
 * do personagem por `BANKAI_DAMAGE_MULTIPLIER` durante `BANKAI_DURATION_MS`.
 *
 * O hook só é dono do relógio (duração + cooldown) e do espelho
 * `bankaiActiveRef`; o multiplicador em si é aplicado no funil que já existe
 * para a Forma Vastolord, para não abrir um caminho novo de dano.
 *
 * A duração corre em ticks de `BANKAI_TICK_MS` que não avançam com a batalha
 * pausada — senão abrir o menu consumiria a janela da liberação. Entrar na
 * Forma Vastolord encerra a Bankai: as duas não acumulam.
 */
export function useBankai({
  player,
  freezeActionsUntilRef,
  isPausedRef,
  battleEndedRef,
  disabledRef,
  vastolordActive,
  bankaiActiveRef,
  onUsed,
  cooldownReduction,
}: Props): BankaiApi {
  const [active, setActive] = useState(false);
  const [activeRemainingMs, setActiveRemainingMs] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const activeRemainingRef = useRef(0);
  const readyAtRef = useRef(0);

  const onUsedRef = useLatestRef(onUsed);
  const cooldownReductionRef = useLatestRef(cooldownReduction);

  const { usable, usableRef } = useSkillGuard({
    player,
    character: "marshadow",
    freezeActionsUntilRef,
    disabledRef,
    isPausedRef,
    battleEndedRef,
    extraCanUse: () =>
      !bankaiActiveRef.current &&
      !vastolordActive &&
      readyAtRef.current <= Date.now(),
  });

  const end = useCallback(() => {
    activeRemainingRef.current = 0;
    bankaiActiveRef.current = false;
    setActiveRemainingMs(0);
    setActive(false);
  }, [bankaiActiveRef]);

  const press = useCallback(() => {
    if (!usableRef.current) return;

    activeRemainingRef.current = BANKAI_DURATION_MS;
    bankaiActiveRef.current = true;
    setActiveRemainingMs(BANKAI_DURATION_MS);
    setActive(true);
    freezeActionsUntilRef.current = Math.max(
      freezeActionsUntilRef.current,
      Date.now() + BANKAI_RELEASE_LOCK_MS,
    );
    onUsedRef.current?.();

    const cooldownMs = applyCooldownReduction(
      BANKAI_COOLDOWN_MS,
      cooldownReductionRef.current,
    );
    readyAtRef.current = Date.now() + cooldownMs;
    setRemaining(cooldownMs / 1000);
  }, [
    bankaiActiveRef,
    cooldownReductionRef,
    freezeActionsUntilRef,
    onUsedRef,
    usableRef,
  ]);

  useEffect(() => {
    if (vastolordActive && bankaiActiveRef.current) end();
  }, [vastolordActive, bankaiActiveRef, end]);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      if (isPausedRef.current) return;
      if (battleEndedRef.current) {
        end();
        return;
      }
      const next = Math.max(0, activeRemainingRef.current - BANKAI_TICK_MS);
      activeRemainingRef.current = next;
      setActiveRemainingMs(next);
      if (next <= 0) end();
    }, BANKAI_TICK_MS);
    return () => window.clearInterval(id);
  }, [active, battleEndedRef, end, isPausedRef]);

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
      bankaiActiveRef.current = false;
    };
  }, [bankaiActiveRef]);

  return { active, activeRemainingMs, press, usable, remaining };
}
