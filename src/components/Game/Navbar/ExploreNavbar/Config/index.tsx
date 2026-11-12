import styles from "./styles.module.css";
import { useConfigSelection } from "@/hooks/menu/config/useConfigSelection";
import { useAudio } from "@/hooks/audio/useAudio";
import { usePlayer } from "@/contexts/PlayerContext";
import { useSettings } from "@/hooks/settings/useSetting";
import { useEffect, useRef } from "react";
import { VictorTutorial } from "@/components/Game/Navbar/ExploreNavbar/Config/VictorTutorial";
import { CONFIG_TABS, CONFIG_TAB_LABELS } from "@/data/config/tabs";
import { BattleTab } from "./BattleTab";
import { DifficultySection } from "./Difficulty";
import { DialogueSpeedSection } from "./DialogueSpeed";
import { HelpSection } from "./Help";
import { VolumeSection } from "./Volume";

export function Config() {
  const { sfxVolume, bgmVolume, setSfxVolume, setBgmVolume } = useAudio();
  const { difficulty } = usePlayer();
  const { dialogueSpeed } = useSettings();
  const {
    selectedIndex,
    selectedColumn,
    screen,
    showQuestIndicator,
    showComboAction,
    showHighlight,
    showAbilityIntro,
    sharedXp,
    language,
    activeTab,
    isOnTab,
    cycleDifficulty,
    cycleDialogueSpeed,
  } = useConfigSelection(true);
  const configRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!configRef.current) return;
    const selectedEl = configRef.current.children[selectedColumn] as
      HTMLElement | undefined;
    if (!selectedEl) return;
    configRef.current.scrollTo({
      top: selectedEl.offsetTop - configRef.current.offsetTop,
      behavior: "smooth",
    });
  }, [selectedColumn]);

  return (
    <div className={`containerOfNavbar ${styles.center}`} ref={configRef}>
      <div className="tabs">
        {CONFIG_TABS.map((tab) => (
          <button
            key={tab}
            className={`${"tab"} ${activeTab === tab ? "tabActive" : ""} ${isOnTab && activeTab === tab ? "tabSelected" : ""}`}
          >
            {CONFIG_TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {activeTab === "geral" && (
        <div className={styles.container}>
          <div>
            <DifficultySection
              selectedIndex={selectedIndex}
              selectedColumn={selectedColumn}
              activeDifficulty={difficulty}
              onPrev={() => cycleDifficulty(-1)}
              onNext={() => cycleDifficulty(1)}
            />

            <DialogueSpeedSection
              selectedIndex={selectedIndex}
              selectedColumn={selectedColumn}
              activeSpeed={dialogueSpeed}
              onPrev={() => cycleDialogueSpeed(-1)}
              onNext={() => cycleDialogueSpeed(1)}
            />
          </div>

          <HelpSection
            selectedColumn={selectedColumn}
            selectedIndex={selectedIndex}
            showQuestIndicator={showQuestIndicator}
            sharedXp={sharedXp}
            language={language}
          />

          <VolumeSection
            sfxVolume={sfxVolume}
            bgmVolume={bgmVolume}
            selectedColumn={selectedColumn}
            onSfxDown={() => setSfxVolume(Math.max(sfxVolume - 10, 0))}
            onSfxUp={() => setSfxVolume(Math.min(sfxVolume + 10, 100))}
            onBgmDown={() => setBgmVolume(Math.max(bgmVolume - 10, 0))}
            onBgmUp={() => setBgmVolume(Math.min(bgmVolume + 10, 100))}
          />
        </div>
      )}

      {activeTab === "batalha" && (
        <BattleTab
          showComboAction={showComboAction}
          showHighlight={showHighlight}
          showAbilityIntro={showAbilityIntro}
          selectedIndex={selectedIndex}
        />
      )}

      {screen === "tutorial" && <VictorTutorial />}
    </div>
  );
}
