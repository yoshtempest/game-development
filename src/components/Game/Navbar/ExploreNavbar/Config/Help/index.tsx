import styles from "@/components/Game/Navbar/ExploreNavbar/Config/styles.module.css";
import InstallButton from "@/components/PWA";
import { UpdateButton } from "@/components/Game/Navbar/ExploreNavbar/Config/UpdateButton";
import type { GameLanguage } from "@/data/settings/language";
import { LANGUAGE_LABEL } from "@/data/settings/language";

type Props = {
  selectedColumn: number;
  selectedIndex: number;
  showQuestIndicator: boolean;
  sharedXp: boolean;
  language: GameLanguage;
};

export function HelpSection({
  selectedColumn,
  selectedIndex,
  showQuestIndicator,
  sharedXp,
  language,
}: Props) {
  return (
    <div className={styles.flexColumn}>
      <h2 className={styles.marginTop}>Ajuda:</h2>
      <div
        className={`${styles.tutorialButton} ${
          selectedColumn === 2 && selectedIndex === 0 ? styles.selected : ""
        }`}
      >
        {selectedColumn === 2 && selectedIndex === 0 && (
          <span className={styles.cursor}>▼</span>
        )}

        <h2>Indicador de Missões: {showQuestIndicator ? "ON" : "OFF"}</h2>
      </div>
      <div
        className={`${styles.tutorialButton} ${
          selectedColumn === 2 && selectedIndex === 1 ? styles.selected : ""
        }`}
      >
        {selectedColumn === 2 && selectedIndex === 1 && (
          <span className={styles.cursor}>▼</span>
        )}

        <h2>Xp Compartilhado: {sharedXp ? "ON" : "OFF"}</h2>
      </div>
      <div
        className={`${styles.tutorialButton} ${
          selectedColumn === 2 && selectedIndex === 2 ? styles.selected : ""
        }`}
      >
        {selectedColumn === 2 && selectedIndex === 2 && (
          <span className={styles.cursor}>▼</span>
        )}

        <h2>Ver Tutorial</h2>
      </div>
      <div
        className={`${styles.tutorialButton} ${
          selectedColumn === 2 && selectedIndex === 3 ? styles.selected : ""
        }`}
      >
        {selectedColumn === 2 && selectedIndex === 3 && (
          <span className={styles.cursor}>▼</span>
        )}

        <UpdateButton />
      </div>
      <div
        className={`${styles.tutorialButton} ${
          selectedColumn === 2 && selectedIndex === 4 ? styles.selected : ""
        }`}
      >
        {selectedColumn === 2 && selectedIndex === 4 && (
          <span className={styles.cursor}>▼</span>
        )}

        <InstallButton />
      </div>
      <div
        className={`${styles.tutorialButton} ${
          selectedColumn === 2 && selectedIndex === 5 ? styles.selected : ""
        }`}
      >
        {selectedColumn === 2 && selectedIndex === 5 && (
          <span className={styles.cursor}>▼</span>
        )}

        <h2>Idioma: {LANGUAGE_LABEL[language]}</h2>
      </div>
      <p className={styles.languageHint}>
        {language === "en"
          ? "Use \"Traduzir esta página\" (Translate this page) no menu do navegador."
          : "Em English, a tradução é feita pelo próprio navegador."}
      </p>
    </div>
  );
}
