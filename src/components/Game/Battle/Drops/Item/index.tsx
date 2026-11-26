import { NpcCardImage } from "@/components/Game/NpcCard";

import { getCardNpcType } from "@/data/npc";
import { itemPath } from "@/utils/paths";

import styles from "./styles.module.css";

type Props = {
  itemDrops: ItemDropInfo[];
};

export function ItemDrops({ itemDrops }: Props) {
  if (itemDrops.length === 0) return null;

  return (
    <div className="section">
      <h2 className="sectionTitle">Itens Coletados</h2>
      <div className="dropsList">
        {itemDrops.map((item) => {
          const cardNpcType = getCardNpcType(item.id);
          return (
            <div key={item.id} className="dropItem">
              {cardNpcType ? (
                <NpcCardImage
                  npcType={cardNpcType}
                  alt={item.name}
                  className="dropIcon"
                />
              ) : (
                <img
                  loading="lazy"
                  decoding="async"
                  className="dropIcon"
                  src={item.image ?? itemPath(`${item.id}.svg`)}
                  alt={item.name}
                />
              )}
              <span className="dropName">{item.name}</span>
              <span className={styles.dropQty}>x{item.qty}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
