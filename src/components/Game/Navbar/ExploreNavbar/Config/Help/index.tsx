import { useNotifications } from "@/contexts/NotificationContext";

import styles from "@/components/Game/Navbar/ExploreNavbar/Config/styles.module.css";
import InstallButton from "@/components/PWA";
import { UpdateButton } from "@/components/Game/Navbar/ExploreNavbar/Config/UpdateButton";

type Props = {
  selectedColumn: number;
  selectedIndex: number;
  showQuestIndicator: boolean;
  sharedXp: boolean;
};

export function HelpSection({
  selectedColumn,
  selectedIndex,
  showQuestIndicator,
  sharedXp,
}: Props) {
  const { enabled, permission, toggleNotifications } = useNotifications();

  const notificationLabel =
    permission === "unsupported"
      ? "Indisponível"
      : permission === "denied"
        ? "Bloqueado"
        : enabled
          ? "ON"
          : "OFF";

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
        onClick={toggleNotifications}
      >
        {selectedColumn === 2 && selectedIndex === 5 && (
          <span className={styles.cursor}>▼</span>
        )}

        <h2>Notificações: {notificationLabel}</h2>
      </div>
    </div>
  );
}
