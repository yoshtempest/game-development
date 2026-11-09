import type { ElementType } from "@/utils/types/battle/element";
import { elementBadgePath } from "@/utils/paths";
import styles from "./styles.module.css";

type Props = {
  types: readonly ElementType[];
};

export function ElementBadges({ types }: Props) {
  return (
    <span className={styles.badges}>
      {types.map((type) => (
        <img loading="lazy" decoding="async"
          key={type}
          src={elementBadgePath(`${type.toLowerCase()}.svg`)}
          alt={type}
          title={type}
          className={styles.badge}
        />
      ))}
    </span>
  );
}
