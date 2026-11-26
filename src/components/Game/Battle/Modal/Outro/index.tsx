import { useEffect } from "react";
import { playerPath } from "@/utils/paths";
import { getOutroLine } from "@/data/battle/outro";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useTypewriter } from "@/hooks/interaction/useTypewriter";
import { useSettings } from "@/hooks/settings/useSetting";
import { useGameControls } from "@/contexts/GameControlsContext";
import { useBattleOutroSound } from "@/hooks/battle/modals/useOutroSound";
import { getOpponentOutroResult } from "@/gameRules/battle/outro";
import { getNpcDisplayName } from "@/data/npc/displayNames";
import type { BattleOutroResult } from "@/utils/types/battle/outro";
import { NpcOutroPortrait } from "./NpcPortrait";

type Props = {
  character: string;
  type: BattleOutroResult;
  /** NPC enfrentado: ganha retrato e som do lado dele, com o resultado invertido. */
  npcType?: string;
  isAlfa?: boolean;
  onNext?: () => void;
};

export function BattleOutro({
  character,
  type,
  npcType,
  isAlfa = false,
  onNext,
}: Props) {
  const title = type === "victory" ? "Vitória" : "Derrota";
  const message = getOutroLine(character, type);

  useBattleOutroSound(character, type, npcType);

  const { dialogueSpeedMs } = useSettings();
  const { displayedText, isComplete, skip } = useTypewriter(
    message,
    dialogueSpeedMs,
  );
  const { pushControls } = useGameControls();

  const isCompleteRef = useLatestRef(isComplete);
  const skipRef = useLatestRef(skip);
  const onNextRef = useLatestRef(onNext);

  useEffect(() => {
    const remove = pushControls({
      onUp: () => true,
      onDown: () => true,
      onLeft: () => true,
      onRight: () => true,
      onConfirm: () => {
        if (!isCompleteRef.current) {
          skipRef.current();
          return true;
        }
        if (onNextRef.current) {
          onNextRef.current();
          return true;
        }
        return;
      },
    });
    return remove;
  }, [pushControls, isCompleteRef, onNextRef, skipRef]);

  return (
    <div className="overlay">
      <div className="talkingContainer">
        <div className="talking">
          <h1>{title}</h1>
          <h2>{displayedText}</h2>
        </div>
        <img
          loading="lazy"
          decoding="async"
          className="talkingImage"
          src={playerPath(`/${character}/expressions/${type}.svg`)}
          alt={character}
        />
        {npcType && (
          <NpcOutroPortrait
            key={`${npcType}-${type}`}
            npcType={npcType}
            result={getOpponentOutroResult(type)}
            alt={getNpcDisplayName(npcType, isAlfa)}
          />
        )}
      </div>
    </div>
  );
}
