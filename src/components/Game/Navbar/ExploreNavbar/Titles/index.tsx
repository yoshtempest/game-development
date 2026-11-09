import { useRef } from "react";
import styles from "./styles.module.css";
import { useTitleMenu } from "@/hooks/menu/useTitle";
import { useTitles } from "@/contexts/TitleContext";
import { TITLES } from "@/data/titles/index";
import { STAT_LABEL } from "@/data/titles/statLabel";

export function TitlesScreen() {
  const { titlesData } = useTitles();
  const listRef = useRef<HTMLDivElement | null>(null);
  const { titleIds, selectedIndex, equippedId } = useTitleMenu(true, listRef);

  return (
    <div className="containerOfNavbar">
      <h2>Títulos</h2>

      <div className={styles.container} ref={listRef}>
        {titleIds.map((id, index) => {
          const def = TITLES[id];
          const progress = titlesData.progress[id];
          if (!def || !progress) return null;

          const isSelected = index === selectedIndex;
          const level = progress.level;
          const isUnlocked = level > 0;
          const isEquipped = equippedId === id;
          const isMaxLevel = level >= def.levels.length;

          const currentLevelDef = isUnlocked ? def.levels[level - 1] : null;
          const nextLevelDef = isMaxLevel ? null : def.levels[level];
          const nextCount = nextLevelDef?.count ?? null;

          const pct = nextCount
            ? Math.min(100, (progress.current / nextCount) * 100)
            : 100;

          return (
            <div
              key={id}
              className={`${styles.titleCard} ${
                isSelected ? styles.selected : ""
              } ${
                isUnlocked
                  ? isEquipped
                    ? styles.titleCardEquipped
                    : styles.titleCardUnlocked
                  : styles.titleCardLocked
              }`}
            >
              <div className={styles.iconBox}>
                <img loading="lazy" decoding="async" src={def.icon} alt="" className={styles.iconImg} />
              </div>

              <div className={styles.info}>
                <div className={styles.titleName}>
                  {def.name}
                  {isUnlocked && ` Nv.${level}`}
                </div>

                <div className={styles.titleDesc}>
                  {typeof def.description === "function"
                    ? def.description(level)
                    : def.description}
                </div>

                {currentLevelDef && (
                  <div className={styles.bonusText}>
                    {currentLevelDef.bonus
                      .map((b) => `${STAT_LABEL[b.stat] ?? b.stat} +${b.value}`)
                      .join(", ")}
                  </div>
                )}

                {!isMaxLevel && (
                  <>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className={styles.progressText}>
                      {progress.current}/{nextCount}
                    </div>
                  </>
                )}

                {isMaxLevel && (
                  <div className={styles.progressText}>Nv.MAX</div>
                )}
              </div>

              {isUnlocked && isEquipped && (
                <span className={styles.equipBadge}>Equipado</span>
              )}
              {isUnlocked && !isEquipped && (
                <span className={styles.equipButton}>Equipar</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
