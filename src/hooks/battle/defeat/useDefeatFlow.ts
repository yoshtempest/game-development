import type { Props } from "./types";
import { useCallback, useState } from "react";
import { computeElapsedBattleTime } from "@/hooks/battle/time/computeElapsedBattleTime";
import { incrementDeath, recordDefeat } from "@/utils/rewards";

export function useDefeatFlow({
  player,
  setBattleHP,
  setBattleMana,
  handleDefeat,
  clearPendingTombstoneSpawn,
  setShowDefeat,
  addBattleTime,
  battleStartRef,
  prevModeRef,
  pauseStartRef,
  pauseDurationRef,
  runDefeatRef,
  resetRewind,
  charge,
  startRecording,
  resetVastolord,
  vastolordUsedRef,
  resetHonoredOne,
  resetTimeScale,
  clearBlink,
  clearDivergentFist,
  divergentFistRef,
  setDivergentFistActive,
  forcePunchRef,
  clearSummons,
  clearAllies,
  clearCoffins,
  coffinStartedRef,
  npcRootedUntilRef,
  rootedSummonsUntilRef,
  summonsBleedUntilRef,
  npcEnchantUntilRef,
  isAlfa,
  summonNpc,
  npcType,
  battle,
  npc,
  resetBattleState,
  resetCombo,
  resetPortals,
  grabbedTimerRef,
  setIsGrabbed,
}: Props) {
  const [defeatElapsed, setDefeatElapsed] = useState(0);

  const runDefeat = useCallback(() => {
    setBattleHP(player.character, null);
    setBattleMana(player.character, null);
    incrementDeath(player.character);
    handleDefeat();
    recordDefeat();
    clearPendingTombstoneSpawn();
    setShowDefeat(true);
    const elapsed = computeElapsedBattleTime(
      battleStartRef,
      prevModeRef,
      pauseStartRef,
      pauseDurationRef,
    );
    setDefeatElapsed(elapsed);
    addBattleTime(player.character, Math.floor(elapsed / 1000));
  }, [
    player.character,
    setBattleHP,
    setBattleMana,
    handleDefeat,
    clearPendingTombstoneSpawn,
    setShowDefeat,
    battleStartRef,
    prevModeRef,
    pauseStartRef,
    pauseDurationRef,
    addBattleTime,
  ]);

  runDefeatRef.current = runDefeat;

  const handleRetry = useCallback(() => {
    charge.cancelCharge();
    resetRewind();
    setShowDefeat(false);
    resetVastolord();
    vastolordUsedRef.current = false;
    resetHonoredOne();
    resetTimeScale();
    clearBlink();
    clearDivergentFist();
    divergentFistRef.current = false;
    setDivergentFistActive(false);
    forcePunchRef.current = false;
    clearSummons();
    clearAllies();
    clearCoffins();
    coffinStartedRef.current = false;
    npcRootedUntilRef.current = 0;
    npcEnchantUntilRef.current = { burn: 0, freeze: 0, poison: 0, bleed: 0 };
    rootedSummonsUntilRef.current = {};
    summonsBleedUntilRef.current = {};
    // O alfa hungryDog invoca os minions na intro dele, que reaparece no retry
    // (resetNpc apaga npc.ai → phase volta para "intro"). Pré-summonar aqui
    // dobraria os minions: 2 direto no meio + 2 da intro da nova tentativa.
    if (isAlfa && npcType !== "hungryDog") {
      summonNpc(npcType);
      summonNpc(npcType);
    }
    battle.resetBattle();
    npc.resetNpc();
    resetBattleState();
    resetCombo();
    // Os portais do babidi vivem fora do estado da batalha: sem este reset a
    // nova tentativa já começaria com os portais fincados no mapa.
    resetPortals();
    battleStartRef.current = Date.now();
    pauseDurationRef.current = 0;
    if (grabbedTimerRef.current) clearTimeout(grabbedTimerRef.current);
    grabbedTimerRef.current = null;
    setIsGrabbed(false);
    startRecording();
  }, [
    charge,
    resetRewind,
    setShowDefeat,
    resetVastolord,
    vastolordUsedRef,
    resetHonoredOne,
    resetTimeScale,
    clearBlink,
    clearDivergentFist,
    divergentFistRef,
    setDivergentFistActive,
    forcePunchRef,
    clearSummons,
    clearAllies,
    clearCoffins,
    coffinStartedRef,
    npcRootedUntilRef,
    npcEnchantUntilRef,
    rootedSummonsUntilRef,
    summonsBleedUntilRef,
    isAlfa,
    summonNpc,
    npcType,
    battle,
    npc,
    resetBattleState,
    resetCombo,
    resetPortals,
    battleStartRef,
    pauseDurationRef,
    grabbedTimerRef,
    setIsGrabbed,
    startRecording,
  ]);

  return {
    runDefeat,
    handleRetry,
    defeatElapsed,
  };
}
