import { Minus, Plus, Volume2, SixteenthNotes } from "lucide-react";

import { BGM_COLUMN, SFX_COLUMN } from "@/hooks/menu/config/configConstants";

import styles from "@/components/Game/Navbar/ExploreNavbar/Config/styles.module.css";

type Props = {
  sfxVolume: number;
  bgmVolume: number;
  selectedColumn: number;
  onSfxDown: () => void;
  onSfxUp: () => void;
  onBgmDown: () => void;
  onBgmUp: () => void;
};

export function VolumeSection({
  sfxVolume,
  bgmVolume,
  selectedColumn,
  onSfxDown,
  onSfxUp,
  onBgmDown,
  onBgmUp,
}: Props) {
  return (
    <div className={styles.flexColumn}>
      <div className="navbarContainerRow sectionHeader">
        <Volume2 />
        <h2>Sons</h2>
      </div>
      <div className={styles.volumeContainer}>
        {selectedColumn === SFX_COLUMN && (
          <span className={styles.cursor}>▼</span>
        )}

      <div className="navbarContainerRow">
        <SixteenthNotes />
        <h2>Efeitos Sonoros: {sfxVolume}</h2>
      </div>

        <div className={styles.flexRow}>
          <button
            type="button"
            className={styles.volumeButton}
            onClick={onSfxDown}
          >
            <Minus />
          </button>
          <div className={styles.volumeBar}>
            <div
              className={styles.volumeFill}
              style={{ width: `${sfxVolume}%` }}
            />
          </div>
          <button
            type="button"
            className={styles.volumeButton}
            onClick={onSfxUp}
          >
            <Plus />
          </button>
        </div>
      </div>
      <div className={styles.volumeContainer}>
        {selectedColumn === BGM_COLUMN && (
          <span className={styles.cursor}>▼</span>
        )}

        <div className="navbarContainerRow">
          <SixteenthNotes />
          <h2>Música de Fundo: {bgmVolume}</h2>
        </div>
        <div className={styles.flexRow}>
          <button
            type="button"
            className={styles.volumeButton}
            onClick={onBgmDown}
          >
            <Minus />
          </button>
          <div className={styles.volumeBar}>
            <div
              className={styles.volumeFill}
              style={{ width: `${bgmVolume}%` }}
            />
          </div>
          <button
            type="button"
            className={styles.volumeButton}
            onClick={onBgmUp}
          >
            <Plus />
          </button>
        </div>
      </div>
    </div>
  );
}
