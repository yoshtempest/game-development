
import type { ReactNode } from "react";

import styles from "./styles.module.css";
import shared from "../styles.module.css"

import { CLASS_DATA } from "@/data/npc";
import { ElementBadges } from "../ElementBadges";

import type { Props } from "../types";

type ListProps = Pick<
  Props,
  | "npcType"
  | "name"
  | "encountered"
  | "kills"
  | "npcClass"
  | "location"
  | "isSelected"
  | "index"
  | "onSelect"
> & {
  artwork: ReactNode;
};

export function BestiaryList({
  artwork,
  npcType,
  name,
  encountered,
  kills,
  npcClass,
  location,
  isSelected,
  index = 0,
  onSelect,
}: ListProps) {
  return (
    <button
      type="button"
      className={`${styles.listItem} ${
        isSelected ? styles.selected : ""
      } ${encountered ? shared.cardEncountered : shared.cardUnknown}`}
      onClick={onSelect}
    >
      <span className={styles.listIndex}>
        {String(index + 1).padStart(2, "0")}
      </span>

      {artwork}

      <span className={styles.listInfo}>
        <span className={styles.listNameRow}>
          <span
            className={
              encountered ? styles.name : shared.unknownName
            }
          >
            {encountered ? name : "???"}
          </span>

          {encountered && <ElementBadges npcType={npcType} />}
        </span>

        <span className={styles.listMeta}>
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

          {encountered ? (
            <span className={styles.listLocation}>
              {location}
            </span>
          ) : (
            <span className={styles.listHint}>
              Derrote este inimigo para descobrir mais
            </span>
          )}
        </span>
      </span>
    </button>
  );
}
