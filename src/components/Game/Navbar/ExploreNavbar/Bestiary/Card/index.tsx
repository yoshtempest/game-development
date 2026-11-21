import styles from "./styles.module.css";
import { CLASS_DATA } from "@/data/npc";
import type { Props } from "./types";
import { ElementBadges } from "./ElementBadges";
import { BestiaryArtwork } from "./Artwork";
import { BestiaryList } from "./List";


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
  baseNpcType,
  isAlfa = false,
  variant = "list",
  index = 0,
  onSelect,
}: Props) {

  const artwork = (
    <BestiaryArtwork
      npcType={npcType}
      baseNpcType={baseNpcType}
      name={name}
      encountered={encountered}
      isAlfa={isAlfa}
      variant={variant}
      index={index}
    />
  );

  if (variant === "list") {
    return (
      <BestiaryList
        artwork={artwork}
        name={name}
        encountered={encountered}
        kills={kills}
        npcClass={npcClass}
        npcType={npcType}
        location={location}
        isSelected={isSelected}
        index={index}
        onSelect={onSelect}
      />
    );
  }

  return (
    <div
      className={`${styles.detailCard} ${
        encountered ? styles.cardEncountered : styles.cardUnknown
      }`}
    >
      <div className={styles.detailTop}>
        {artwork}

        <div className={styles.detailIdentity}>
          {encountered ? (
            <>
              <div className={styles.nameRow}>
                <h3 className={styles.detailName}>{name}</h3>
                <ElementBadges npcType={npcType} />
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
            </>
          ) : (
            <>
              <div className={styles.nameRow}>
                <h3 className={`${styles.detailName} ${styles.unknownName}`}>
                  ???
                </h3>
              </div>
              {npcClass && (
                <div className={styles.metaRow}>
                  <span
                    className={styles.classBadge}
                    style={{ color: CLASS_DATA[npcClass].color }}
                  >
                    {CLASS_DATA[npcClass].label}
                  </span>
                </div>
              )}
              <div className={styles.unknownHint}>
                Derrote este inimigo para descobrir mais
              </div>
            </>
          )}
        </div>
      </div>

      {encountered && (
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
                    <span className={styles.dropChance}>{drop.chance}</span>
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
      )}
    </div>
  );
}
