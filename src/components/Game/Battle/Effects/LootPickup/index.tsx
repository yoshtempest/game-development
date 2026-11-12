import type { LootNotification } from "@/utils/types/battle/loot";

import styles from "./styles.module.css";

type Props = {
  notifications: LootNotification[];
  scaleX: number;
  scaleY: number;
};

const HEAD_GAP = 14;

export function LootPickup({ notifications, scaleX, scaleY }: Props) {
  return (
    <>
      {notifications.map((n) => (
        <div
          key={n.id}
          className={styles.notification}
          style={{
            left: n.x * scaleX,
            top: n.y * scaleY - HEAD_GAP,
            translate: "-50% -100%",
          }}
        >
          {n.entries.map((entry) => (
            <div key={entry.name} className={styles.entry}>
              <img
                loading="lazy"
                decoding="async"
                className={styles.icon}
                src={entry.icon}
                alt={entry.name}
              />
              <span className={styles.qty}>x{entry.qty}</span>
              <span className={styles.name}>{entry.name}</span>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
