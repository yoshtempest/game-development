import { LOOTBAG_SPRITES } from "@/data/battle/lootbags";
import { ITEMS } from "@/data/items";
import { getViewportSize } from "@/utils/viewport";
import { SLOT_ICONS } from "@/utils/equipment/equipmentMenu";
import type { BattleLootBag } from "@/utils/types/battle/loot";

import styles from "./styles.module.css";

type Props = {
  bag: BattleLootBag;
  TILE_SIZE: number;
  npcClass: NPCClass;
};

function bagBadgeIcon(bag: BattleLootBag): string | null {
  if (bag.contents.hyperCoins > 0) {
    return ITEMS.hypercoin.image;
  }
  if (bag.contents.chestDrop) {
    const chest = ITEMS[bag.contents.chestDrop.id];
    return chest?.image ?? null;
  }
  if (bag.contents.coins > 0) {
    return ITEMS.kwanzas.image;
  }
  const equip = bag.contents.equipmentDrops[0];
  if (equip) {
    return SLOT_ICONS[equip.slot];
  }
  const item = bag.contents.itemDrops[0];
  if (item && item.image) return item.image;
  return null;
}

export function LootBag({ bag, TILE_SIZE, npcClass }: Props) {
  const scaleX = getViewportSize().width / 1000;
  const scaleY = getViewportSize().height / 600;
  const badge = bagBadgeIcon(bag);

  return (
    <div
      className={styles.lootBag}
      style={{
        width: TILE_SIZE * 0.5,
        height: TILE_SIZE * 0.5,
        left: bag.x * scaleX,
        top: bag.y * scaleY,
        transform: "translate(-50%, -100%)",
        zIndex: 8,
      }}
    >
      <img
        loading="lazy"
        decoding="async"
        className={styles.sprite}
        src={LOOTBAG_SPRITES[npcClass]}
        alt="Lootbag"
      />
      {badge && (
        <img
          loading="lazy"
          decoding="async"
          className={styles.badge}
          src={badge}
          alt="item"
        />
      )}
    </div>
  );
}
