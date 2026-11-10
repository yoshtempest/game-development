
import { BattleClear } from "@/components/Game/Battle/Modal/Clear";
import { BattleOutro } from "@/components/Game/Battle/Modal/Outro";
import { BattleHighlight } from "@/components/Game/Battle/Modal/Highlight";
import { VictoryModal } from "@/components/Game/Battle/Modal/Victory";
import { DefeatModal } from "@/components/Game/Battle/Modal/Defeat";
import type { Props } from "./types";

export function BattleModals(props: Props) {
  const {
    showClear,
    isTraining,
    showOutro,
    handleCloseOutro,
    playerCharacter,
    showHighlight,
    highlightData,
    handleCloseHighlight,
    showVictory,
    npcType,
    npcLevel,
    xpReward,
    lastRewards,
    handleContinue,
    skipVictoryDelay,
    victoryElapsed,
    bestTime,
    getReplayData,
    isAlfa,
    titleProgressSnapshot,
    showDefeat,
    handleRetry,
    navigate,
    defeatProgress,
    defeatElapsed,
    showRetry,
  } = props;

  return (
    <>
      {showClear && !isTraining && <BattleClear />}
      {showOutro && !isTraining && (
        <BattleOutro
          character={playerCharacter}
          type={showOutro}
          onNext={handleCloseOutro}
        />
      )}

      {!showOutro && showHighlight && highlightData && !isTraining && (
        <BattleHighlight replay={highlightData} onClose={handleCloseHighlight} />
      )}

      {!showOutro && !showHighlight && showVictory && !isTraining && (
        <VictoryModal
          isOpen={showVictory}
          character={playerCharacter}
          enemyType={npcType}
          enemyLevel={npcLevel}
          xpReward={xpReward}
          rewards={lastRewards}
          onContinue={handleContinue}
          skipDelay={skipVictoryDelay}
          elapsed={victoryElapsed}
          bestTime={bestTime}
          getReplayData={getReplayData}
          isAlfa={isAlfa}
          titleProgressSnapshot={titleProgressSnapshot}
        />
      )}

      {!showOutro && !showHighlight && showDefeat && !isTraining && (
        <DefeatModal
          isOpen={showDefeat}
          onContinue={handleRetry}
          onBack={() => navigate(-1)}
          progress={defeatProgress}
          elapsed={defeatElapsed}
          bestTime={bestTime}
          showRetry={showRetry}
        />
      )}
    </>
  );
}