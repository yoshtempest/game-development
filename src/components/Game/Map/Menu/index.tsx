import styles from "./styles.module.css";
import { useMapMenu } from "@/hooks/menu/useMap";
import { playerPath } from "@/utils/paths";
import { SCENE_MAP, type MapCell } from "@/data/scene/map";
import { useQuests } from "@/contexts/QuestContext";
import { useSettings } from "@/hooks/settings/useSetting";
import { QUEST_ROUTES } from "@/data/quests/waypoints";

type Props = {
  currentRoute: string;
  character: string;
};

function matchCell(cell: MapCell, route: string) {
  return cell.routes.some((prefix) => route.startsWith(prefix));
}

export function MapOverlay({ currentRoute, character }: Props) {
  useMapMenu();
  const { quests } = useQuests();
  const { showQuestIndicator } = useSettings();

  const activeTargetRoutes = new Set<string>();
  if (showQuestIndicator) {
    for (const quest of quests) {
      if (quest.completed || quest.claimed) continue;
      const route = QUEST_ROUTES[quest.id];
      if (route) activeTargetRoutes.add(route);
    }
  }

  function hasQuest(cell: MapCell) {
    for (const route of activeTargetRoutes) {
      if (matchCell(cell, route)) return true;
    }
    return false;
  }

  return (
    <div className={styles.mapOverlay}>
      <div className={styles.mapGrid}>
        {SCENE_MAP.map((row, y) =>
          row.map((cell, x) => {
            if (!cell) {
              return (
                <div
                  key={`${x}-${y}`}
                  className={`${styles.cell} ${styles.empty}`}
                />
              );
            }
            const isCurrent = matchCell(cell, currentRoute);
            const cellHasQuest = hasQuest(cell);
            return (
              <div
                key={`${x}-${y}`}
                className={`${styles.cell} ${isCurrent ? styles.current : ""}`}
              >
                <img loading="lazy" decoding="async"
                  className={styles.sceneImage}
                  src={cell.image}
                  alt={cell.label}
                />
                <span className={styles.label}>{cell.label}</span>
                {isCurrent && (
                  <img loading="lazy" decoding="async"
                    className={`${styles.face} ${cellHasQuest ? styles.faceShifted : ""}`}
                    src={playerPath(`${character}/face.svg`)}
                    alt="Jogador"
                  />
                )}
                {cellHasQuest && <div className={styles.questBadge}>!</div>}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
