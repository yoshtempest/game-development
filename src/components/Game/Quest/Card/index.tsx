import styles from "./styles.module.css";
import { statusIconPath, itemPath, coinPath } from "@/utils/paths";
import { FREQ_LABEL } from "@/data/quests/frequencies";

const REWARD_ICON: Partial<Record<QuestRewardsType, string>> = {
  xp: statusIconPath("xp.svg"),
  item: itemPath("all.svg"),
  coin: coinPath("kwanzas.svg"),
  hyperCoin: coinPath("hypercoins.svg"),
};

type Props = {
  quest: Quest;
  selected: boolean;
};

export function QuestCard({ quest, selected }: Props) {
  const isActive = quest.completed && !quest.claimed;
  const icon = quest.rewardsType ? REWARD_ICON[quest.rewardsType] : null;

  return (
    <div
      style={{
        background: isActive ? "#2e7d32" : "#1a1a1a",
        border: selected ? "2px solid yellow" : "2px solid transparent",
        opacity: isActive ? 0.8 : 1,
      }}
      className={styles.container}
    >
      <div className={styles.row}>
        <img loading="lazy" decoding="async" src={quest.image ?? ""} className={styles.image} width={50} />
        <h3>{quest.name}</h3>
        {quest.frequency && (
          <span className={styles.freqBadge} data-freq={quest.frequency}>
            {FREQ_LABEL[quest.frequency]}
          </span>
        )}
      </div>

      <p>{quest.description}</p>
      <div className={styles.rowTwo}>
        <span>
          {quest.progress} / {quest.counter}{" "}
        </span>
        <span className={styles.reward}>
          {quest.rewards}
          {icon && <img loading="lazy" decoding="async" src={icon} className={styles.rewardIcon} />}
        </span>
      </div>
    </div>
  );
}
