import type { Props } from "./types";
import { useEffect, useState } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { isDead } from "@/gameRules/battle/death";

export function useBattleLifecycle({
  playerHP,
  npcHP,
  npcClass,
  setNpcPhase,
  npcPhaseRef,
  setNpcHP,
  npcMaxHp,
  onPlayerDeath,
  onNpcDeath,
  isEnding,
}: Props) {
  const [isNpcDying, setNpcDying] = useState(false);

  const onPlayerDeathRef = useLatestRef(onPlayerDeath);
  const onNpcDeathRef = useLatestRef(onNpcDeath);
  const npcClassRef = useLatestRef(npcClass);
  const npcMaxHpRef = useLatestRef(npcMaxHp);

  useEffect(() => {
    if (isEnding.current) return;
    if (!isDead(playerHP)) return;

    isEnding.current = true;
    const timeout = window.setTimeout(() => {
      onPlayerDeathRef.current();
      isEnding.current = false;
    }, 500);

    return () => clearTimeout(timeout);
  }, [playerHP, isEnding, onPlayerDeathRef]);

  useEffect(() => {
    if (isEnding.current) return;
    if (!isDead(npcHP)) return;

    if (npcClassRef.current === "boss" && npcPhaseRef.current === 1) {
      npcPhaseRef.current = 2;
      setNpcPhase(2);
      setNpcHP(npcMaxHpRef.current);
      return;
    }

    isEnding.current = true;
    setNpcDying(true);
    const timeout = window.setTimeout(() => {
      onNpcDeathRef.current();
    }, 300);

    return () => clearTimeout(timeout);
  }, [
    npcHP,
    setNpcPhase,
    setNpcHP,
    isEnding,
    npcPhaseRef,
    npcClassRef,
    npcMaxHpRef,
    onNpcDeathRef,
  ]);

  return { isNpcDying };
}
