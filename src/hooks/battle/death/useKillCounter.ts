import { useRef } from "react";
import { useTitles } from "@/contexts/TitleContext";
import { useBestiary } from "@/contexts/BestiaryContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useCharacterProgress } from "@/contexts/CharacterProgressContext";
import { incrementClassKill } from "@/utils/rewards";

export function useBattleKillCounter() {
  const { incrementKillCounter, incrementAlfaKillCounter } = useTitles();
  const { registerDefeat } = useBestiary();
  const { player } = usePlayer();
  const { incrementKills } = useCharacterProgress();
  const npcTypeRef = useRef("");
  const npcDataRef = useRef<{ class: NPCClass }>({ class: "common" });

  function handleNpcDeath(
    npcType: string,
    npcClass: NPCClass,
    isAlfa?: boolean,
  ) {
    incrementKillCounter(npcType, npcClass);
    if (isAlfa) incrementAlfaKillCounter();
    registerDefeat(isAlfa ? `${npcType}_alfa` : npcType);
    incrementKills(player.character);
    incrementClassKill(npcClass);
  }

  return { npcTypeRef, npcDataRef, handleNpcDeath };
}
