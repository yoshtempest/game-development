import { useRef, useState } from "react";
import styles from "./styles.module.css";
import { useBestiaryMenu } from "@/hooks/menu/useBestiary";
import { useBestiary } from "@/contexts/BestiaryContext";
import { BESTIARY_DATA } from "@/data/bestiary";
import {
  getNpcClass,
  getLinkedTitles,
  getDropItems,
} from "@/gameRules/npc/bestiary";
import { getNpcElementTypes } from "@/data/types/npcElementTypes";
import { BestiaryCard } from "./Card";
import { CLASS_DATA } from "@/data/npc";
import type { ElementType } from "@/utils/types/battle/element";
import type { NPCClass } from "@/data/npc";

const ELEMENTS: ElementType[] = [
  "Aquos", "Pyrus", "Subterra", "Ventus", "Darkus",
  "Electricus", "Haos", "Metallum", "Natura", "Psychicus",
  "Nympha", "Cryo", "Draco", "Umbra", "Normalis",
];

export function DeliciaDex() {
  const { hasEncountered, getKills, bestiary } = useBestiary();
  const listRef = useRef<HTMLDivElement | null>(null);
  const { selectedIndex, npcIds } = useBestiaryMenu(true, listRef);

  const [elementFilter, setElementFilter] = useState<ElementType | "all">("all");
  const [classFilter, setClassFilter] = useState<NPCClass | "all">("all");

  const filteredIds = npcIds.filter((id) => {
    const entry = BESTIARY_DATA[id];
    if (!entry) return false;
    if (elementFilter !== "all") {
      const elements = getNpcElementTypes(id);
      if (!elements.includes(elementFilter)) return false;
    }
    if (classFilter !== "all") {
      const npcClass = getNpcClass(id);
      if (npcClass !== classFilter) return false;
    }
    return true;
  });

  const encounteredCount = filteredIds.filter(
    (id) => bestiary[id]?.encountered,
  ).length;

  return (
    <div className="containerOfNavbar">
      <div className={styles.flexRow}>
        <h2>DelíciaDex</h2>

        <div className={styles.counter}>
          {encounteredCount}/{filteredIds.length} encontrados
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        <select
          value={elementFilter}
          onChange={(e) => setElementFilter(e.target.value as ElementType | "all")}
        >
          <option value="all">Todas tipagens</option>
          {ELEMENTS.map((el) => (
            <option key={el} value={el}>
              {el}
            </option>
          ))}
        </select>

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value as NPCClass | "all")}
        >
          <option value="all">Todas classes</option>
          {Object.keys(CLASS_DATA).map((cls) => (
            <option key={cls} value={cls}>
              {CLASS_DATA[cls as NPCClass].label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.container} ref={listRef}>
        {filteredIds.map((npcType, index) => {
          const entry = BESTIARY_DATA[npcType];
          if (!entry) return null;

          const encountered = hasEncountered(npcType);
          const kills = getKills(npcType);
          const isSelected = index === selectedIndex;
          const npcClass = getNpcClass(npcType);
          const linkedTitles =
            encountered && npcClass ? getLinkedTitles(npcType, npcClass) : [];
          const dropItems =
            encountered && npcClass ? getDropItems(npcClass, npcType) : [];

          return (
            <BestiaryCard
              key={npcType}
              npcType={npcType}
              isAlfa={entry.isAlfa}
              baseNpcType={entry.baseNpcType}
              name={entry.name}
              encountered={encountered}
              kills={kills}
              npcClass={npcClass}
              location={entry.location}
              description={entry.description}
              attacks={entry.attacks}
              dropItems={dropItems}
              linkedTitles={linkedTitles}
              isSelected={isSelected}
            />
          );
        })}
      </div>
    </div>
  );
}