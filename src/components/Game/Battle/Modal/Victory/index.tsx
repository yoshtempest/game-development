import styles from "./styles.module.css";
import { playerPath } from "@/utils/paths";
import { getNpcDisplayName } from "@/data/npc";
import { useVictoryVisibility } from "@/hooks/battle/victory/useVisibility";
import { useVictoryKeyboard } from "@/hooks/battle/victory/useKeyboard";
import { EquipmentDrops } from "@/components/Game/Battle/Drops/Equipment";
import { ItemDrops } from "@/components/Game/Battle/Drops/Item";
import { ChestDrops } from "@/components/Game/Battle/Drops/Chest";
import { TitleProgresses } from "@/components/Game/Battle/TitleProgresses";
import { formatDuration } from "@/utils/formatDuration";
import { ActivePotionDisplay } from "@/components/Game/Battle/ActivePotionDisplay";
import { saveReplay } from "@/data/replays";
import type { ReplayData } from "@/utils/types/replay";
import type { TitlesData } from "@/utils/types/player/titles";
import { useRef, useState } from "react";

type Props = {
  isOpen: boolean;
  character: string;
  enemyType: string;
  enemyLevel: number;
  onContinue: () => void;
  xpReward: number;
  rewards: RewardInfo | null;
  skipDelay?: boolean;
  elapsed: number;
  bestTime: number;
  getReplayData?: () => ReplayData | null;
  isAlfa?: boolean;
  titleProgressSnapshot?: TitlesData["progress"];
};

export function VictoryModal({
  isOpen,
  character,
  enemyType,
  enemyLevel,
  onContinue,
  rewards,
  skipDelay = false,
  elapsed,
  bestTime,
  getReplayData,
  isAlfa = false,
  titleProgressSnapshot,
}: Props) {
  const isVisible = useVictoryVisibility(isOpen, skipDelay);
  const scrollRef = useRef<HTMLDivElement>(null);
  useVictoryKeyboard(isVisible, onContinue, scrollRef);
  const [replaySaved, setReplaySaved] = useState(false);

  const handleSaveReplay = () => {
    if (!getReplayData) return;
    const data = getReplayData();
    if (data && saveReplay(data)) {
      setReplaySaved(true);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="overlay">
      <div className={`modal ${styles.modal}`}>
        <div className={styles.header}>
          <img loading="lazy" decoding="async"
            src={playerPath(`/${character}/expressions/default.svg`)}
            alt={character}
            className={styles.characterImage}
          />
          <div>
            <h1>Vitória!</h1>
            <p>
              Você derrotou um {getNpcDisplayName(enemyType, isAlfa)} - nv.
              {enemyLevel}
            </p>

            <div className={styles.timeSection}>
              <p className={styles.timeRow}>
                <span className={styles.timeLabel}>Tempo:</span>
                <span>{formatDuration(elapsed)}</span>
              </p>
              <p className={styles.timeRow}>
                <span className={styles.timeLabel}>Melhor tempo:</span>
                <span>{bestTime > 0 ? formatDuration(bestTime) : "0:00"}</span>
              </p>
            </div>
          </div>
        </div>

        <div ref={scrollRef} className={styles.scrollArea}>
          <div className={styles.flexRow}>
            <div className={styles.flexColumn}>
              <ActivePotionDisplay />
              <EquipmentDrops equipmentDrops={rewards?.equipmentDrops ?? []} />
              <ItemDrops itemDrops={rewards?.itemDrops ?? []} />
              <ChestDrops
                chestDrop={rewards?.chestDrop ?? null}
                keyDrop={rewards?.keyDrop ?? null}
              />
              <TitleProgresses titleProgressSnapshot={titleProgressSnapshot} />
              <div className={styles.flexRow}>
                {getReplayData && (
                  <button
                    className={`${styles.button} ${replaySaved ? styles.buttonSaved : ""}`}
                    onClick={handleSaveReplay}
                    disabled={replaySaved}
                  >
                    {replaySaved ? "Replay Salvo!" : "Salvar Replay"}
                  </button>
                )}
                <button className={styles.button} onClick={onContinue}>
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
