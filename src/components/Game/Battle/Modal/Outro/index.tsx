import { useEffect } from "react";
import { playerPath } from "@/utils/paths";
import { getOutroLine } from "@/data/battle/outro";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useTypewriter } from "@/hooks/interaction/useTypewriter";
import { useSettings } from "@/hooks/settings/useSetting";
import { useGameControls } from "@/contexts/GameControlsContext";
import { useBattleOutroSound } from "@/hooks/battle/modals/useOutroSound";

type Props = {
  character: string;
  type: "victory" | "defeat";
  onNext?: () => void;
};

export function BattleOutro({ character, type, onNext }: Props) {
  const title = type === "victory" ? "Vitória" : "Derrota";
  const message = getOutroLine(character, type);

  useBattleOutroSound(character, type);

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
      </div>
    </div>
  );
}
