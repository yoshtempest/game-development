import styles from "./styles.module.css";
import { StatItem } from "@/components/Game/Navbar/BattleNavbar/Settings/StatItem";
import type { ReactNode } from "react";

type Stat = {
  label: string;
  value: React.ReactNode;
};

type Props = {
  spriteSrc: string;
  name: string;
  subtitle?: ReactNode;
  level: number;
  rank: string;
  stats: Stat[];
  alt?: string;
};

export function BattleCard({
  spriteSrc,
  name,
  subtitle,
  level,
  rank,
  stats,
  alt,
}: Props) {
  return (
    <div className={styles.battleCard}>
      <div className={styles.battleCardHeader}>
        <img loading="lazy" decoding="async" src={spriteSrc} alt={alt ?? name} className={styles.sprite} />
        <div>
          <h3>{name}</h3>
          {subtitle}
          <p className={styles.statLine}>Nível: {level}</p>
          <span className={styles.rank}>{rank}</span>
        </div>
      </div>
      <div className={styles.statGrid}>
        {stats.map((stat) => (
          <StatItem key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>
    </div>
  );
}
