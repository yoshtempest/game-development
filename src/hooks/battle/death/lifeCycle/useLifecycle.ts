import type { Props } from "./types";
import { useEffect, useState } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { isDead } from "@/gameRules/battle/death";
import { getNpcPhaseCount } from "@/data/npc";

export function useBattleLifecycle({
  playerHP,
  npcHP,
  npcClass,
  npcType,
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
  const npcTypeRef = useLatestRef(npcType);
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

    const phaseCount = getNpcPhaseCount(
      npcTypeRef.current,
      npcClassRef.current,
    );
    const currentPhase = npcPhaseRef.current;
    if (currentPhase < phaseCount) {
      const nextPhase = currentPhase + 1;
      npcPhaseRef.current = nextPhase;
      setNpcPhase(nextPhase);
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
    npcTypeRef,
    npcMaxHpRef,
    onNpcDeathRef,
  ]);

  return { isNpcDying };
}
