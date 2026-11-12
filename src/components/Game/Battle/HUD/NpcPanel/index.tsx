import { HealthBar } from "@/components/Game/Battle/HUD/HealthBar";
import { BlockGauge } from "@/components/Game/Battle/HUD/BlockGauge";
import { AlfaSpecialGauge } from "@/components/Game/Battle/HUD/AlfaSpecialGauge";
import { ElementBadges } from "@/components/Game/Battle/HUD/ElementBadges";
import { npcPath, rankBadgePath } from "@/utils/paths";
import { getNpcDisplayName } from "@/data/npc";
import type { ElementType } from "@/utils/types/battle/element";
import styles from "@/components/Game/Battle/HUD/styles.module.css";
import { getRank, srcRank } from "@/gameRules/rank";

type Props = {
  npcType: string;
  npcLevel?: number;
  npcHP: number;
  npcMaxHp: number;
  isAlfa?: boolean;
  npcElementTypes?: readonly ElementType[];
  blockGauge?: number;
  blockLimit?: number;
  specialGauge?: number;
  /** PvP: nome do oponente no lugar do nome do NPC. */
  displayName?: string;
  /** PvP: retrato do personagem do oponente no lugar da face do NPC. */
  faceSrc?: string;
};

export function NPCHUDPanel({
  npcType,
  npcLevel,
  npcHP,
  npcMaxHp,
  isAlfa = false,
  npcElementTypes,
  blockGauge,
  blockLimit,
  specialGauge,
  displayName,
  faceSrc,
}: Props) {
  const playerRank = `${srcRank(getRank(npcLevel ?? 1))}`;
  return (
    <div className={styles.container} style={{ right: 10, top: 10 }}>
      <div className={styles.npcInfo}>
        <div className={`${styles.nameRow} ${styles.nameRowEnd}`}>
          {npcElementTypes && <ElementBadges types={npcElementTypes} />}
          <h2 className={`${"hudName"} ${styles.name}`}>
            {displayName ?? getNpcDisplayName(npcType, isAlfa)} - Nv.
            {npcLevel}
          </h2>
        </div>

        <HealthBar hp={npcHP} maxHp={npcMaxHp} reversed />
      </div>
      <div>
        {npcLevel !== undefined && (
          <img
            loading="lazy"
            decoding="async"
            src={rankBadgePath(playerRank)}
            className={styles.rankBadge}
          />
        )}
        <img
          loading="lazy"
          decoding="async"
          src={faceSrc ?? npcPath(`/${npcType}/face.svg`)}
          alt="Npc HUD"
          className="hudImage"
        />
        {blockGauge != null && blockLimit != null && (
          <BlockGauge blockGauge={blockGauge} blockLimit={blockLimit} />
        )}
        {specialGauge != null && <AlfaSpecialGauge gauge={specialGauge} />}
      </div>
    </div>
  );
}
