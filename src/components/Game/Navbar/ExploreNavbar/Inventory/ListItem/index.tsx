import { NpcCardImage } from "@/components/Game/NpcCard";

import { ITEMS } from "@/data/items";
import { getCardNpcType } from "@/data/npc";
import { itemPath } from "@/utils/paths";
import type { InventoryItem } from "@/utils/types/player/inventory";
import styles from "./styles.module.css";

type Props = {
  item: InventoryItem;
  isSelected: boolean;
  rejected: boolean;
};

export function ListItem({ item, isSelected, rejected }: Props) {
  const itemData = ITEMS[item.id];
  const cardNpcType = getCardNpcType(item.id);

  return (
    <li
      className={`InventoryItem ${styles.cell} ${isSelected ? "active" : ""} ${
        rejected ? styles.rejected : ""
      }`}
    >
      {itemData && (
        <div className={styles.itemCell}>
          {/* A quantidade acompanha o ícone; a descrição fica só no painel do
              item selecionado, para o grid caber em 5 colunas. */}
          <span className={styles.iconWrap}>
            {cardNpcType ? (
              <NpcCardImage
                npcType={cardNpcType}
                alt={itemData.name}
                className={styles.icon}
              />
            ) : (
              <img
                loading="lazy"
                decoding="async"
                className={styles.icon}
                src={itemData.image ?? itemPath(`${item.id}.svg`)}
                alt={itemData.name}
              />
            )}
            {!!item.qty && item.qty > 0 && (
              <span className={styles.qty}>{item.qty}</span>
            )}
          </span>

          <span className={styles.name}>{itemData.name}</span>
        </div>
      )}
    </li>
  );
}
