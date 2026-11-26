
import styles from "./styles.module.css";
import shared from "../../styles.module.css";

import { CLASS_DATA } from "@/data/npc";
import { ElementBadges } from "@/components/Game/Navbar/ExploreNavbar/Bestiary/Card/ElementBadges";

import type { Props } from "@/components/Game/Navbar/ExploreNavbar/Bestiary/Card/types";

type IdentityProps = Pick<
  Props,
  | "npcType"
  | "name"
  | "encountered"
  | "kills"
  | "npcClass"
  | "location"
  | "description"
>;

export function BestiaryIdentity({
  npcType,
  name,
  encountered,
  kills,
  npcClass,
  location,
  description,
}: IdentityProps) {
  return (
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
                className={shared.classBadge}
                style={{ color: CLASS_DATA[npcClass].color }}
              >
                {CLASS_DATA[npcClass].label}
              </span>
            )}

            <span className={shared.killCount}>
              {kills} {kills === 1 ? "vez" : "vezes"} derrotado
            </span>
          </div>

          <div className={styles.location}>{location}</div>

          <div className={styles.description}>{description}</div>
        </>
      ) : (
        <>
          <div className={styles.nameRow}>
            <h3
              className={`${styles.detailName} ${shared.unknownName}`}
            >
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
  );
}
