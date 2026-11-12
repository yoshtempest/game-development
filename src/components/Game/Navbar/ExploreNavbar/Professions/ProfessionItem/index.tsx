import { type ProfessionWeaponConfig } from "@/data/professions/weapons";
import { npcPath, professionBadgePath } from "@/utils/paths";
import type {
  ProfessionInfo,
  ProfessionProficiency,
} from "@/utils/types/player/profession";
import type { Character } from "@/utils/types/player/player";
import { ProgressBar } from "@/components/Game/ProgressBar";
import styles from "./styles.module.css";

type Props = {
  profession: ProfessionInfo;
  config: ProfessionWeaponConfig;
  selected: boolean;
  character: Character;
  equippedWeaponId: string | undefined;
  isOwnedAny: (id: EquipmentId) => boolean;
  proficiency: ProfessionProficiency;
  xpToNext: number;
  items: { id: string; qty?: number }[];
  onOpen: () => void;
};

export function ProfessionItem({
  profession,
  selected,
  character,
  proficiency,
  xpToNext,
  onOpen,
}: Props) {
  return (
    <li
      className={`${styles.item} ${selected ? styles.selected : ""}`}
      onClick={onOpen}
    >
      <img
        loading="lazy"
        decoding="async"
        src={npcPath(`/professionals/${profession.id}.svg`)}
        className={styles.image}
      />
      <div className={styles.info}>
        <span className={styles.npc}>{profession.npcName}</span>
        <div className={styles.flexRow}>
          <img
            loading="lazy"
            decoding="async"
            src={professionBadgePath(`/${profession.id}.svg`)}
            alt=""
            className={styles.toolIcon}
          />
          <span className={styles.name}>{profession.name}</span>
        </div>
        <div className={styles.proficiency}>
          <span className={styles.levelBadge}>Nv {proficiency.level}</span>
          <ProgressBar
            value={proficiency.xp}
            max={xpToNext}
            animationId={`prof-xp-${character}-${profession.id}`}
            level={proficiency.level}
          />
          <span className={styles.xpText}>
            {proficiency.xp}/{xpToNext}
          </span>
        </div>
        <button onClick={onOpen}>Craft de Items</button>
      </div>
    </li>
  );
}
