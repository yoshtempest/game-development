import { elementBadgePath } from "@/utils/paths";
import { getNpcElementTypes } from "@/data/types/npcElementTypes";
import styles from "@/components/Game/Navbar/ExploreNavbar/Bestiary/styles.module.css"

export function ElementBadges({ npcType }: { npcType: string }) {
  return (
    <>
      {getNpcElementTypes(npcType).map((element) => (
        <img
          loading="lazy"
          decoding="async"
          key={element}
          src={elementBadgePath(`${element.toLowerCase()}.svg`)}
          alt={element}
          title={element}
          className={styles.elementBadge}
        />
      ))}
    </>
  );
}