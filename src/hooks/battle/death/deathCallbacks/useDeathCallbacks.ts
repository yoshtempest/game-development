import type { Params } from "./types";
import { useRef } from "react";
import {
  incrementDeath,
  recordWin,
  recordDefeat,
  incrementEquipmentDropsStats,
} from "@/utils/rewards";
import { saveGame } from "@/services/save/saveService";
import { saveBestTime, loadBestTime } from "@/utils/bestTime";

export function useDeathCallbacks({
  playerCharacter,
  playerClass,
  location,
  items,
  quests,
  npcType,
  isAlfa,
  handleDefeat,
  addBattleTime,
  reduceHunger,
  setShowDefeat,
  setVictoryElapsed,
  setDefeatElapsed,
  setBestTime,
  triggerVictory,
  setLastRewards,
  giveRewards,
  progressDailyWeekly,
  incrementPetDropCounter,
  killCounter,
  battleStartRef,
}: Params) {
  const onPlayerDeathRef = useRef(() => {});
  onPlayerDeathRef.current = () => {
    incrementDeath(playerCharacter);
    handleDefeat();
    recordDefeat();
    setShowDefeat(true);
    const elapsed = Date.now() - battleStartRef.current;
    setDefeatElapsed(elapsed);
    addBattleTime(playerCharacter, Math.floor(elapsed / 1000));
  };

  const onNpcDeathRef = useRef(() => {});
  onNpcDeathRef.current = () => {
    const rewards = giveRewards();
    setLastRewards(rewards);
    reduceHunger(playerCharacter, 5);
    if (rewards.equipmentDrops.length > 0) {
      incrementEquipmentDropsStats(rewards.equipmentDrops.length);
    }
    const hasPetDrop = rewards.equipmentDrops.some((d) =>
      d.id.startsWith("pet_"),
    );
    if (hasPetDrop) incrementPetDropCounter();
    recordWin(playerCharacter);

    progressDailyWeekly("win_battle", 1);
    progressDailyWeekly("kill_any", 1);

    const npcClass = killCounter.npcDataRef.current.class;
    if (npcClass === "common") progressDailyWeekly("kill_common", 1);
    else if (npcClass === "rare") progressDailyWeekly("kill_rare", 1);
    else if (npcClass === "epic") progressDailyWeekly("kill_epic", 1);
    else if (npcClass === "boss") progressDailyWeekly("kill_boss", 1);

    saveGame({
      lastRoute: location.pathname,
      inventory: items,
      quests,
      playerClass,
      character: playerCharacter,
    });
    const elapsed = Date.now() - battleStartRef.current;
    setVictoryElapsed(elapsed);
    addBattleTime(playerCharacter, Math.floor(elapsed / 1000));
    saveBestTime(npcType, elapsed);
    setBestTime(loadBestTime(npcType));
    triggerVictory();
    killCounter.handleNpcDeath(
      npcType,
      killCounter.npcDataRef.current.class,
      isAlfa,
    );
  };

  return { onPlayerDeathRef, onNpcDeathRef };
}
