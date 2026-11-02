import { HealthBar } from "@/components/Game/Battle/HUD/HealthBar";
import { npcPath } from "@/utils/paths";
import { getNpcDisplayName } from "@/data/npc";
import styles from "./styles.module.css";


type Props = {
  allies: SummonedNpc[];
};

export function AllyHUDList({ allies }: Props) {
  const alive = allies.filter((a) => !a.isDying && a.hp > 0);
  if (alive.length === 0) return null;

  return (
    <>
      {alive.map((a, i) => (
        <div
          key={a.id}
          className={styles.container}
          style={{ left: 10, top: 10 + i * 96 }}
        >
          <div className={styles.info}>
            <h2 className={styles.name}>
              {getNpcDisplayName(a.npcType)}
              {a.level !== undefined && ` - Nv.${a.level}`}
            </h2>
            <HealthBar hp={a.hp} maxHp={a.maxHp} reversed={false} />
          </div>
          <img
            src={npcPath(`/${a.npcType}/face.svg`)}
            alt={`${a.npcType} HUD`}
            className={styles.image}
            onError={(e) => {
              e.currentTarget.style.visibility = "hidden";
            }}
          />
        </div>
      ))}
    </>
  );
}
