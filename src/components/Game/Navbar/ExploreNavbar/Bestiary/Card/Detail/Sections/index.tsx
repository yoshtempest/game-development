
import styles from "./styles.module.css";

import type { Props } from "../../types";

type SectionsProps = Pick<
  Props,
  "attacks" | "dropItems" | "linkedTitles"
>;

export function BestiarySections({
  attacks,
  dropItems,
  linkedTitles,
}: SectionsProps) {
  return (
    <>
      {attacks.length > 0 && (
        <div className={styles.sectionPanel}>
          <div className={styles.sectionTitle}>Ataques</div>

          <div className={styles.attacks}>
            {attacks.map((attack) => (
              <span key={attack} className={styles.attackTag}>
                {attack}
              </span>
            ))}
          </div>
        </div>
      )}

      {dropItems.length > 0 && (
        <div className={styles.sectionPanel}>
          <div className={styles.sectionTitle}>Drops</div>

          <div className={styles.dropGrid}>
            {dropItems.map((drop) => (
              <span key={drop.name} className={styles.dropTag}>
                {drop.name}

                <span className={styles.dropChance}>
                  {drop.chance}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {linkedTitles.length > 0 && (
        <div className={styles.sectionPanel}>
          <div className={styles.sectionTitle}>Títulos</div>

          <div className={styles.titleList}>
            {linkedTitles.map((titleName) => (
              <span key={titleName} className={styles.titleTag}>
                {titleName}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
