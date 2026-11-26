
import type { ReactNode } from "react";

import styles from "./styles.module.css";
import shared from "../styles.module.css";

import { BestiaryIdentity } from "./Identity";
import { BestiarySections } from "./Sections";

import type { Props } from "../types";

type DetailProps = Pick<
  Props,
  | "npcType"
  | "name"
  | "encountered"
  | "kills"
  | "npcClass"
  | "location"
  | "description"
  | "attacks"
  | "dropItems"
  | "linkedTitles"
> & {
  artwork: ReactNode;
};

export function BestiaryDetail({
  artwork,
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
}: DetailProps) {
  return (
    <div
      className={`${styles.detailCard} ${
        encountered ? shared.cardEncountered : shared.cardUnknown
      }`}
    >
      <div className={styles.detailTop}>
        {artwork}

        <BestiaryIdentity
          npcType={npcType}
          name={name}
          encountered={encountered}
          kills={kills}
          npcClass={npcClass}
          location={location}
          description={description}
        />
      </div>

      {encountered && (
        <BestiarySections
          attacks={attacks}
          dropItems={dropItems}
          linkedTitles={linkedTitles}
        />
      )}
    </div>
  );
}
