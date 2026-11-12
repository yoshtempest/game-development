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
        {itemDrops.map((item) => (
          <div key={item.id} className="dropItem">
            <img
              loading="lazy"
              decoding="async"
              className="dropIcon"
              src={item.image ?? itemPath(`${item.id}.svg`)}
              alt={item.name}
            />
            <span className="dropName">{item.name}</span>
            <span className={styles.dropQty}>x{item.qty}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
