import { getEquipmentById } from "@/data/equipment";
import { RANK_COLORS, RANK_LABELS } from "@/data/equipment/definitions";
import {
  PROFESSION_WEAPON_TIERS,
  getProfessionWeaponId,
  type ProfessionWeaponConfig,
} from "@/data/professions/weapons";
import {
  getStatLabel,
  professionIcon,
} from "@/components/Game/Navbar/ExploreNavbar/Professions/professionUtils";
import type { ProfessionInfo } from "@/utils/types/player/profession";
import type { InventoryItem } from "@/utils/types/player/inventory";
import { MaterialList } from "@/components/Game/Navbar/ExploreNavbar/Professions/ProfessionDetail/MaterialList";
import styles from "./styles.module.css";

type Props = {
  profession: ProfessionInfo;
  config: ProfessionWeaponConfig;
  selectedIndex: number;
  isTierOwned: (index: number) => boolean;
  canCraftTier: (index: number) => boolean;
  items: InventoryItem[];
};

export function RankDetails({
  profession,
  config,
  selectedIndex,
  isTierOwned,
  canCraftTier,
  items,
}: Props) {
  const selectedTier = PROFESSION_WEAPON_TIERS[selectedIndex]!;
  const weaponId = getProfessionWeaponId(config, selectedTier.id);
  const equipment = getEquipmentById(weaponId);
  const rankColor = RANK_COLORS[selectedTier.rank];

  const owned = isTierOwned(selectedIndex);
  const craftable = canCraftTier(selectedIndex);

  function renderStats() {
    if (!equipment) return null;
    const entries = Object.entries(equipment.stats).filter(
      ([, v]) => typeof v === "number" && v !== 0,
    );
    if (entries.length === 0) return null;
    return (
      <div className={styles.statsBlock}>
        {entries.map(([key, value]) => (
          <div key={key} className={styles.statRow}>
            <span className={styles.statLabel}>{getStatLabel(key)}</span>
            <span className={styles.statValue}>{value}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.rightPanel}>
      <div className={styles.detailHeader}>
        <img
          loading="lazy"
          decoding="async"
          className={styles.detailIcon}
          src={professionIcon(profession.id)}
          alt=""
        />
        <div>
          <span className={styles.detailName} style={{ color: rankColor }}>
            {config.baseName} {selectedTier.label}
          </span>
          <span className={styles.detailRank}>
            Ranque {RANK_LABELS[selectedTier.rank]}
          </span>
        </div>
      </div>

      <div className={styles.bonusSection}>
        <div className={styles.bonusRow}>
          <span className={styles.bonusLabel}>Bônus vs {config.element}</span>
          <span className={styles.bonusValue}>
            +{(selectedTier.damageBonus * 100).toFixed(0)}%
          </span>
        </div>
        <div className={styles.bonusRow}>
          <span className={styles.bonusLabel}>Chance de material</span>
          <span className={styles.bonusValue}>
            {(selectedTier.materialDrop * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {renderStats()}

      <div className={styles.craftSection}>
        <span className={styles.craftTitle}>
          {selectedIndex === 0
            ? "Materiais para craftar"
            : "Material de upgrade"}
        </span>
        <MaterialList
          config={config}
          tierIndex={selectedIndex}
          items={items}
          recipe={selectedIndex === 0 ? profession.recipe : undefined}
        />
      </div>

      <div className={styles.actionRow}>
        {owned ? (
          <span className={styles.statusOwned}>★ Obtida</span>
        ) : craftable ? (
          <span className={styles.statusCraftable}>
            {selectedIndex === 0 ? "Craftar" : "Evoluir"}
          </span>
        ) : (
          <span className={styles.statusLocked}>Falta material</span>
        )}
      </div>
    </div>
  );
}
