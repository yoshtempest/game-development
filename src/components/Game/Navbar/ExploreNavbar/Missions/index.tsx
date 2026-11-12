import { useQuests } from "@/contexts/QuestContext";
import { useQuestMenu } from "@/hooks/menu/quest/useQuestMenu";
import type { QuestTab } from "@/utils/types/player/quest";
import styles from "./styles.module.css";
import { QuestCard } from "@/components/Game/Quest/Card";
import { useEffect, useRef, useState } from "react";
import {
  getTimeUntilMidnight,
  getTimeUntilMonday,
} from "@/utils/quest/questTimer";
import { TAB_ICONS, TAB_KEYS, getEmptyMessage } from "@/data/quests/tabs";
import { Timer } from "lucide-react";

export function Mission() {
  const { quests } = useQuests();
  const listRef = useRef<HTMLUListElement>(null);

  const {
    selectedIndex,
    activeTab,
    activeQuests,
    completedQuests,
    dailyQuests,
    weeklyQuests,
    visibleQuests,
    switchTab,
  } = useQuestMenu(true, quests, listRef);

  const [dailyTimer, setDailyTimer] = useState(getTimeUntilMidnight());
  const [weeklyTimer, setWeeklyTimer] = useState(getTimeUntilMonday());

  useEffect(() => {
    const interval = setInterval(() => {
      setDailyTimer(getTimeUntilMidnight());
      setWeeklyTimer(getTimeUntilMonday());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const tabCountMap: Record<QuestTab, number> = {
    active: activeQuests.length,
    completed: completedQuests.length,
    daily: dailyQuests.length,
    weekly: weeklyQuests.length,
  };

  return (
    <div className="containerOfNavbar">
      <div className="tabs">
        {TAB_KEYS.map((key, i) => (
          <button
            key={key}
            className={`${"tab"} ${activeTab === key ? "tabActive" : ""} ${selectedIndex === i ? "tabSelected" : ""}`}
            onClick={() => switchTab(key)}
          >
            <img
              loading="lazy"
              decoding="async"
              src={TAB_ICONS[key]}
              alt={key}
              className={styles.tabIcon}
            />
            ({tabCountMap[key]})
          </button>
        ))}
        {(activeTab === "daily" || activeTab === "weekly") && (
          <div className={styles.timerBar}>
            {activeTab === "daily" && (
              <div>
                <Timer size={16} />
                <strong>{dailyTimer}</strong>
              </div>
            )}
            {activeTab === "weekly" && (
              <div>
                <Timer size={16} />
                <strong>{weeklyTimer}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {visibleQuests.length === 0 ? (
        <p className={styles.empty}>{getEmptyMessage(activeTab)}</p>
      ) : (
        <ul className={styles.ul} ref={listRef}>
          {visibleQuests.map((q, index) => (
            <QuestCard
              key={q.id}
              quest={q}
              selected={index === selectedIndex - TAB_KEYS.length}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
