import { HealthBar } from "@/components/Game/Battle/HUD/HealthBar";
import { npcPath } from "@/utils/paths";
import { getNpcDisplayName } from "@/data/npc";
import { formatRank, getRank } from "@/gameRules/rank";
import styles from "./styles.module.css";

type Props = {
  npcType: string;
  npcLevel: number;
  nhp: number;
  nmaxhp: number;
};

export function HudNpc({ npcType, npcLevel, nhp, nmaxhp }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <h2 className={`${"hudName"} ${styles.name}`}>
          {getNpcDisplayName(npcType)}
        </h2>
        <p className={`${"hudRank"} ${styles.rank}`}>
          {formatRank(getRank(npcLevel))}
        </p>
        <HealthBar hp={nhp} maxHp={nmaxhp} reversed />
      </div>
      <img
        loading="lazy"
        decoding="async"
        src={npcPath(`/${npcType}/face.svg`)}
        alt="Npc HUD"
        className="hudImage"
      />
    </div>
  );
}
