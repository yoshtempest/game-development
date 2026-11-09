import { useMemo } from "react";
import type { ChestOpenResult } from "@/hooks/chest/useChestOpening";
import type { DailyChestResult } from "@/hooks/chest/useDailyChest";
import {
  RANK_COLORS,
  RANK_LABELS,
  SLOT_LABELS,
} from "@/data/equipment/definitions";
import { itemPath } from "@/utils/paths";
import { MATERIALS } from "@/data/items/materials";
import { ITEMS } from "@/data/items";
import { FILTER_LABELS } from "@/utils/equipment/equipmentMenu";
import styles from "./styles.module.css";

type Props = {
  result: ChestOpenResult | DailyChestResult;
  isDaily: boolean;
  otherChestAvailable: boolean;
  selectedIndex: number;
  onSelect: (index: number) => void;
  onConfirm: () => void;
};

export function ChestRewards({
  result,
  isDaily,
  otherChestAvailable,
  selectedIndex,
  onSelect,
  onConfirm,
}: Props) {
  const options = useMemo(() => {
    const list = [];
    if (!isDaily && otherChestAvailable) {
      list.push("Abrir outro báu");
    }
    list.push("Fechar");
    return list;
  }, [isDaily, otherChestAvailable]);

  const materialImage = (id: string) =>
    MATERIALS[id as keyof typeof MATERIALS]?.image ??
    ITEMS[id as keyof typeof ITEMS]?.image ??
    itemPath(`${id}.svg`);

  return (
    <div className="containerOfNavbar">
      <h3>{isDaily ? "Baú Diário — Aberto!" : "Baú Aberto!"}</h3>

      {result.materials.length > 0 && (
        <div className={styles.section}>
          <h4>Materiais</h4>
          {result.materials.map((m) => (
            <div key={m.id} className={styles.dropRow}>
              <img loading="lazy" decoding="async"
                className="dropIcon"
                src={materialImage(m.id)}
                alt={m.name}
              />
              <span>{m.name}</span>
              <span className="InventoryQty">x{m.qty}</span>
            </div>
          ))}
        </div>
      )}

      {result.equipment.length > 0 && (
        <div className={styles.section}>
          <h4>Equipamentos</h4>
          {result.equipment.map((eq, index) => (
            <div key={`${eq.id}-${index}`} className={styles.dropRow}>
              <img loading="lazy" decoding="async"
                className="dropIcon"
                src={FILTER_LABELS[eq.slot]}
                alt={eq.name}
              />
              <span style={{ color: RANK_COLORS[eq.rank] }}>
                [{RANK_LABELS[eq.rank]}]
              </span>
              <span>{eq.name}</span>
              <span className={styles.slot}>({SLOT_LABELS[eq.slot]})</span>
              {eq.enhance > 0 && (
                <span className={styles.enhance}>+{eq.enhance}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {result.pets.length > 0 && (
        <div className={styles.section}>
          <h4>Pets</h4>
          {result.pets.map((pet) => (
            <div key={pet.id} className={styles.dropRow}>
              <img loading="lazy" decoding="async"
                className="dropIcon"
                src={FILTER_LABELS.pet}
                alt={pet.name}
              />
              <span style={{ color: RANK_COLORS[pet.rank] }}>
                [{RANK_LABELS[pet.rank]}]
              </span>
              <span>{pet.name}</span>
              <span className={styles.slot}>({SLOT_LABELS[pet.slot]})</span>
            </div>
          ))}
        </div>
      )}

      {options.length === 1 ? (
        <button
          className={isDaily ? "dailyButton" : "InventoryButton"}
          onClick={onConfirm}
        >
          {options[0]}
        </button>
      ) : (
        <div className={styles.actions}>
          {options.map((opt, i) => (
            <button
              key={opt}
              className={`${isDaily ? "dailyButton" : "InventoryButton"} ${
                i === selectedIndex ? styles.actionSelected : ""
              }`}
              onClick={() => {
                onSelect(i);
                onConfirm();
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
