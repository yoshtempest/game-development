import { formatCompactNumber } from "@/utils/formatCompactNumber";
import styles from "./styles.module.css";

type Props = {
  label: string;
  value: number;
  max?: number;
  tone?: "mana" | "cursed";
};

export function EnergyBar({ label, value, max = 100, tone = "mana" }: Props) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const barColor =
    tone === "cursed"
      ? pct >= 100
        ? "#ff2d55"
        : pct > 50
          ? "#e84118"
          : "#7a2b1f"
      : pct >= 100
        ? "#00e5ff"
        : pct > 50
          ? "#7fc7ff"
          : "#3f6f8f";

  return (
    <div className={styles.energyTrack}>
      <div
        className={styles.fill}
        style={{
          width: `${pct}%`,
          background: barColor,
        }}
      />
      <div className={styles.text}>
        {label} {formatCompactNumber(value)} / {formatCompactNumber(max)}
      </div>
    </div>
  );
}
