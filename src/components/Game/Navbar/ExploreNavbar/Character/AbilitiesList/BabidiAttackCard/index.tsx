import styles from "@/components/Game/Navbar/ExploreNavbar/Character/AbilitiesList/styles.module.css";
import { Zap } from "lucide-react";
import { playerPath, playerProjectilePath } from "@/utils/paths";

export const BABIDI_ATTACK_OPTIONS = [
  {
    id: "withGun",
    image: "/babidi/inFight/withGun/attacks/leftHandAttack.svg",
    label: "Pistola",
    projectile: "/yellowDog.svg",
    description: "Dispara ataques de energia contra o inimigo.",
  },
  {
    id: "withMissile",
    image: "/babidi/inFight/withMissile/attacks/attack.svg",
    label: "Míssil",
    projectile: "/missile.svg",
    description: "Lança mísseis explosivos contra o inimigo.",
  },
] as const;

export function BabidiAttackCard({
  mode,
  selected,
  onSelect,
}: {
  mode: (typeof BABIDI_ATTACK_OPTIONS)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ""}`}
      onClick={onSelect}
      style={{ cursor: "pointer" }}
    >
      <div className={styles.imageContainer}>
        <img
          loading="lazy"
          decoding="async"
          src={playerPath(mode.image)}
          className={styles.image}
        />
        <img
          loading="lazy"
          decoding="async"
          src={playerProjectilePath(mode.projectile)}
          className={styles.projectileImage}
        />
      </div>

      <div className={styles.header}>
        <Zap size={16} color="#fbbf24" />
        <span className={styles.name}>{mode.label}</span>

        {selected && (
          <span className={`${styles.badge} ${styles.badgeActive}`}>
            Selecionado
          </span>
        )}
      </div>

      <p className={styles.description}>{mode.description}</p>
    </div>
  );
}
