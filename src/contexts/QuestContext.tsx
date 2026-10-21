import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import type { ReactNode } from "react";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { useToast } from "@/contexts/ToastContext";
import { DAILY_QUEST_POOL, WEEKLY_QUEST_POOL } from "@/data/quests";
import {
  getTodayDate,
  getWeekStart,
  generateQuestsFromPool,
} from "@/data/quests/generation";
import {
  QUESTS_KEY,
  DAILY_QUEST_DATE_KEY,
  WEEKLY_QUEST_DATE_KEY,
} from "@/data/storageKeys";
import { slotKey } from "@/services/save/slotManager";
import { useCompressedStorage } from "@/hooks/useCompressedStorage";

type Props = {
  children: ReactNode;
};

type QuestContextType = {
  quests: Quest[];
  addQuest: (quest: Quest) => void;
  updateProgress: (id: string, value: number) => void;
  claimQuest: (id: string) => void;
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>;
  progressDailyWeekly: (type: string, value: number) => void;
  refreshDailyWeekly: () => void;
};

const QuestContext = createContext<QuestContextType | null>(null);

export function QuestProvider({ children }: Props) {
  const [quests, setQuests] = useCompressedStorage<Quest[]>(QUESTS_KEY, []);
  const { playSound } = useSoundEffects();
  const { showToast } = useToast();

  /**
   * Sinaliza que uma mutação de quest de fato alterou algo; o som dispara
   * no effect, fora dos updaters (updater precisa ser puro).
   */
  const pendingQuestSoundRef = useRef(false);

  useEffect(() => {
    if (!pendingQuestSoundRef.current) return;
    pendingQuestSoundRef.current = false;
    playSound("questUpdated");
  }, [quests, playSound]);

  // Geração diária/semanal lendo estado recente via ref e persistindo
  // localStorage fora do updater.
  const questsRef = useRef(quests);
  questsRef.current = quests;

  const generateDailyWeekly = useCallback(() => {
    const todayDate = getTodayDate();
    const weekStart = getWeekStart();
    const savedDailyDate = localStorage.getItem(slotKey(DAILY_QUEST_DATE_KEY));
    const savedWeeklyDate = localStorage.getItem(
      slotKey(WEEKLY_QUEST_DATE_KEY),
    );

    const current = questsRef.current;
    const hasDaily = current.some((q) => q.frequency === "daily");
    const hasWeekly = current.some((q) => q.frequency === "weekly");

    const needsDailyReset = savedDailyDate !== todayDate || !hasDaily;
    const needsWeeklyReset = savedWeeklyDate !== weekStart || !hasWeekly;

    if (!needsDailyReset && !needsWeeklyReset) return;

    const filtered = current.filter(
      (q) => q.frequency !== "daily" && q.frequency !== "weekly",
    );

    if (needsDailyReset) {
      localStorage.setItem(slotKey(DAILY_QUEST_DATE_KEY), todayDate);
      const dailyQuests = generateQuestsFromPool(DAILY_QUEST_POOL, "daily");
      filtered.push(...dailyQuests);
    }

    if (needsWeeklyReset) {
      localStorage.setItem(slotKey(WEEKLY_QUEST_DATE_KEY), weekStart);
      const weeklyQuests = generateQuestsFromPool(WEEKLY_QUEST_POOL, "weekly");
      filtered.push(...weeklyQuests);
    }

    setQuests(filtered);
  }, [setQuests]);

  const addQuest = useCallback(
    (newQuest: Quest) => {
      setQuests((prev) => {
        const exists = prev.find((q) => q.id === newQuest.id);
        if (exists) return prev;
        pendingQuestSoundRef.current = true;
        return [
          ...prev,
          {
            ...newQuest,
            claimed: false,
          },
        ];
      });
      // Toast de nova missão: imagem do NPC + nome da missão
      showToast({
        icon: newQuest.image,
        text: `Nova missão: ${newQuest.name}!`,
      });
    },
    [setQuests, showToast],
  );

  const updateProgress = useCallback(
    (id: string, value: number) => {
      setQuests((prev) => {
        let changed = false;
        const next = prev.map((q) => {
          if (q.id !== id) return q;

          const newProgress = Math.min(q.progress + value, q.counter);
          if (newProgress === q.progress) return q;
          changed = true;

          return {
            ...q,
            progress: newProgress,
            completed: newProgress >= q.counter,
          };
        });
        if (!changed) return prev;
        pendingQuestSoundRef.current = true;
        return next;
      });
    },
    [setQuests],
  );

  const claimQuest = useCallback(
    (id: string) => {
      setQuests((prev) => {
        const target = prev.find((q) => q.id === id);
        if (!target || target.claimed) return prev;
        pendingQuestSoundRef.current = true;
        return prev.map((q) => (q.id === id ? { ...q, claimed: true } : q));
      });
    },
    [setQuests],
  );

  const progressDailyWeekly = useCallback(
    (type: string, value: number) => {
      setQuests((prev) => {
        let changed = false;
        const next = prev.map((q) => {
          if (q.frequency !== "daily" && q.frequency !== "weekly") return q;
          if (q.progressType !== type) return q;
          if (q.completed) return q;

          const newProgress = Math.min(q.progress + value, q.counter);
          if (newProgress === q.progress) return q;
          changed = true;

          return {
            ...q,
            progress: newProgress,
            completed: newProgress >= q.counter,
          };
        });
        if (!changed) return prev;
        pendingQuestSoundRef.current = true;
        return next;
      });
    },
    [setQuests],
  );

  const value = useMemo(
    () => ({
      quests,
      setQuests,
      addQuest,
      updateProgress,
      claimQuest,
      progressDailyWeekly,
      refreshDailyWeekly: generateDailyWeekly,
    }),
    [
      quests,
      setQuests,
      addQuest,
      updateProgress,
      claimQuest,
      progressDailyWeekly,
      generateDailyWeekly,
    ],
  );

  return (
    <QuestContext.Provider value={value}>{children}</QuestContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useQuests() {
  const ctx = useContext(QuestContext);
  if (!ctx) throw new Error("useQuests precisa do QuestProvider");
  return ctx;
}
