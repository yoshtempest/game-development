import { ITEMS } from "@/data/items";
import {
  PROFESSION_WEAPON_TIERS,
  type ProfessionWeaponConfig,
} from "@/data/professions/weapons";
import type { CraftRecipe } from "@/utils/types/player/profession";
import type { InventoryItem } from "@/utils/types/player/inventory";
import styles from "./styles.module.css";

type Props = {
  config: ProfessionWeaponConfig;
  tierIndex: number;
  items: InventoryItem[];
  recipe?: CraftRecipe;
};

function getMatOwned(items: InventoryItem[], id: string): number {
  const found = items.find((i) => i.id === (id as ItemId));
  return found?.qty ?? 0;
}

function MaterialRow({
  name,
  image,
  needed,
  owned,
}: {
  name: string;
  image: string | null;
  needed: number;
  owned: number;
}) {
  return (
    <div className={styles.materialRow}>
      {image && (
        <img
          loading="lazy"
          decoding="async"
          className={styles.materialImg}
          src={image}
          alt={name}
        />
      )}
      <span className={styles.materialName}>{name}</span>
      <span
        className={`${styles.materialQty} ${
          owned >= needed ? styles.matEnough : styles.matMissing
        }`}
      >
        {owned}/{needed}
      </span>
    </div>
  );
}

export function MaterialList({ config, tierIndex, items, recipe }: Props) {
  if (tierIndex === 0 && recipe) {
    return (
      <div className={styles.materialsList}>
        {Object.entries(recipe).map(([id, qty]) => {
          const def = ITEMS[id as keyof typeof ITEMS];
          const name = def?.name ?? id;
          const image =
            def && "image" in def ? (def as { image: string }).image : null;
          const needed = qty ?? 1;
          const owned = getMatOwned(items, id);
          return (
            <MaterialRow
              key={id}
              name={name}
              image={image}
              needed={needed}
              owned={owned}
            />
          );
        })}
      </div>
    );
  }

  const prevTier = PROFESSION_WEAPON_TIERS[tierIndex - 1];
  if (!prevTier) return null;

  const matDef = ITEMS[config.materialId as keyof typeof ITEMS];
  const matImage =
    matDef && "image" in matDef ? (matDef as { image: string }).image : null;
  const matOwned = getMatOwned(items, config.materialId);
  const matNeeded = prevTier.materialQty;

  return (
    <div className={styles.materialsList}>
      <MaterialRow
        name={config.materialName}
        image={matImage}
        needed={matNeeded}
        owned={matOwned}
      />
    </div>
  );
}
