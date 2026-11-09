import styles from "./styles.module.css";
import undertale from "/assets/songs/background/UndertaleGameOver.m4a";
import { useBackgroundAudio } from "@/hooks/audio/useBackgroundAudio";
import { rootAssetPath } from "@/utils/paths";
import { useGameModeMenu } from "@/hooks/menu/useGameMode";

export default function Intro() {
  const { selectedIndex, options } = useGameModeMenu();

  useBackgroundAudio(undertale);

  return (
    <div className={`Master ${styles.image}`}>
      <img loading="lazy" decoding="async" src={rootAssetPath("logo.svg")} alt="logo" className="logo" />

      <div className={styles.menu}>
        {options.map((option, index) => (
          <div
            key={option.label}
            className={`${styles.option} ${
              selectedIndex === index ? styles.selected : ""
            }`}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
}
