import styles from "@/components/Game/Navbar/ExploreNavbar/Bestiary/styles.module.css";
import { npcPath, elementBadgePath } from "@/utils/paths";
import { CLASS_DATA, type NPCClass } from "@/data/npc";
import { getNpcElementTypes } from "@/data/types/npcElementTypes";

type DropItem = {
  name: string;
  chance: string;
};

type Props = {
  npcType: string;
  name: string;
  encountered: boolean;
  kills: number;
  npcClass: NPCClass | null;
  location: string;
  description: string;
  attacks: string[];
  dropItems: DropItem[];
  linkedTitles: string[];
  isSelected: boolean;
};

export function BestiaryCard({
  npcType,
  name,
  encountered,
  kills,
  npcClass,
  location,
  description,
  attacks,
  dropItems,
  linkedTitles,
  isSelected,
}: Props) {
  return (
    <div
      className={`${styles.card} ${
        isSelected ? styles.selected : ""
      } ${encountered ? styles.cardEncountered : styles.cardUnknown}`}
    >
      <div className={styles.spriteBox}>
        <img
          src={npcPath(`/${npcType.replace(/_alfa$/, "")}/default.svg`)}
          alt={name}
          className={`${styles.sprite} ${encountered ? "" : styles.silhouette}`}
          onError={(e) => {
            const img = e.currentTarget;

            if (img.dataset.fallback === "default") {
              img.dataset.fallback = "walk";
              img.src = npcPath(`/${npcType}/walk.svg`);
            } else if (img.dataset.fallback === "walk") {
              img.dataset.fallback = "right";
              img.src = npcPath(`/${npcType}/right.svg`);
            }
          }}
          data-fallback="default"
        />
      </div>

      <div className={styles.info}>
        {encountered ? (
          <>
            <div className={styles.nameRow}>
              <div className={styles.name}>{name}</div>
              {getNpcElementTypes(npcType).map((element) => (
                <img
                  key={element}
                  src={elementBadgePath(`${element.toLowerCase()}.svg`)}
                  alt={element}
                  title={element}
                  className={styles.elementBadge}
                />
              ))}
            </div>

            <div className={styles.metaRow}>
              {npcClass && (
                <span
                  className={styles.classBadge}
                  style={{ color: CLASS_DATA[npcClass].color }}
                >
                  {CLASS_DATA[npcClass].label}
                </span>
              )}
              <span className={styles.killCount}>
                {kills} {kills === 1 ? "vez" : "vezes"} derrotado
              </span>
            </div>

            <div className={styles.location}>{location}</div>
            <div className={styles.description}>{description}</div>

            <div className={styles.attacks}>
              {attacks.map((attack) => (
                <span key={attack} className={styles.attackTag}>
                  {attack}
                </span>
              ))}
            </div>

            {dropItems.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Drops</div>
                <div className={styles.dropGrid}>
                  {dropItems.map((drop) => (
                    <span key={drop.name} className={styles.dropTag}>
                      {drop.name}
                      <span className={styles.dropChance}>{drop.chance}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {linkedTitles.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Títulos</div>
                <div className={styles.titleList}>
                  {linkedTitles.map((titleName) => {
                    return (
                      <span key={titleName} className={styles.titleTag}>
                        {titleName}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className={styles.unknownName}>???</div>
            {npcClass && (
              <span
                className={styles.classBadge}
                style={{ color: CLASS_DATA[npcClass].color }}
              >
                {CLASS_DATA[npcClass].label}
              </span>
            )}
            <div className={styles.unknownHint}>
              Derrote este inimigo para descobrir mais
            </div>
          </>
        )}
      </div>
    </div>
  );
}
