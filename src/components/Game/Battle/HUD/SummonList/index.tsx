import { HealthBar } from "@/components/Game/Battle/HUD/HealthBar";
import { npcPath } from "@/utils/paths";
import { getNpcDisplayName } from "@/data/npc";
import styles from "@/components/Game/Battle/HUD/styles.module.css";

type Props = {
  summons: SummonedNpc[];
  npcType?: string;
};

export function SummonHUDList({ summons, npcType }: Props) {
  const alive = summons.filter((s) => s.hp > 0);
  if (alive.length === 0) return null;

  return (
    <>
      {alive.map((s, i) => (
        <div
          key={s.id}
          className={styles.container}
          style={{ right: 10, top: 10 + (i + 1) * 100 }}
        >
          <div className={styles.npcInfo}>
            <h2 className={styles.name}>
              {getNpcDisplayName(s.npcType)}
              {s.level !== undefined && ` - Nv.${s.level}`}
            </h2>
            <HealthBar hp={s.hp} maxHp={s.maxHp} reversed />
          </div>
          <img
            loading="lazy"
            decoding="async"
            src={npcPath(`/${s.npcType}/face.svg`)}
            alt={`${s.npcType} HUD`}
            className="hudImage"
            onError={(e) => {
              const img = e.currentTarget;

              if (img.dataset.fallback === "default") {
                img.dataset.fallback = "right";
                img.src = npcPath(`/${npcType}/right.svg`);
              } else if (img.dataset.fallback === "right") {
                img.dataset.fallback = "walk";
                img.src = npcPath(`/${npcType}/walk.svg`);
              }
            }}
          />
        </div>
      ))}
    </>
  );
}
