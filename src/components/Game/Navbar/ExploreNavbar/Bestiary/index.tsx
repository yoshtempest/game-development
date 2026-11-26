import { useEffect, useRef, useState } from "react";
import styles from "./styles.module.css";
import { useBestiaryMenu } from "@/hooks/menu/useBestiary";
import { useBestiary } from "@/contexts/BestiaryContext";
import { BESTIARY_DATA, BESTIARY_NPC_ORDER } from "@/data/bestiary";
import {
  getNpcClass,
  getLinkedTitles,
  getDropItems,
} from "@/gameRules/npc/bestiary";
import { BestiaryCard } from "./Card";
import { CLASS_DATA } from "@/data/npc";
import type { ElementType } from "@/utils/types/battle/element";
import type { NPCClass } from "@/data/npc";

const ELEMENTS: ElementType[] = [
  "Aquos",
  "Pyrus",
  "Subterra",
  "Ventus",
  "Darkus",
  "Electricus",
  "Haos",
  "Metallum",
  "Natura",
  "Psychicus",
  "Nympha",
  "Cryo",
  "Draco",
  "Umbra",
  "Normalis",
];

export function DeliciaDex() {
  const { hasEncountered, getKills } = useBestiary();
  const listRef = useRef<HTMLDivElement | null>(null);

  const [elementFilter, setElementFilter] = useState<ElementType | "all">(
    "all",
  );
  const [classFilter, setClassFilter] = useState<NPCClass | "all">("all");

  // A lista filtrada alimenta a navegação por teclado: sem isso as setas
  // caminhavam pela ordem completa e pulavam para fora dos resultados.
  const entries = BESTIARY_NPC_ORDER.flatMap((npcType) => {
    const entry = BESTIARY_DATA[npcType];
    if (!entry) return [];

    const encountered = hasEncountered(npcType);
    const npcClass = getNpcClass(npcType);

    return [
      {
        ...entry,
        npcType,
        encountered,
        kills: getKills(npcType),
        npcClass,
        linkedTitles:
          encountered && npcClass ? getLinkedTitles(npcType, npcClass) : [],
        dropItems:
          encountered && npcClass ? getDropItems(npcClass, npcType) : [],
      },
    ];
  });

  const { selectedIndex, setSelectedIndex } = useBestiaryMenu(
    true,
    listRef,
    entries.length,
  );

  useEffect(() => {
    setSelectedIndex((prev) => (prev < entries.length ? prev : 0));
  }, [entries.length, setSelectedIndex]);

  const encounteredCount = entries.filter((entry) => entry.encountered).length;
  const visibleIndex = Math.min(selectedIndex, Math.max(0, entries.length - 1));
  const selected = entries[visibleIndex];

  return (
    <div className={`containerOfNavbar ${styles.wrapper}`}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.flexRow}>
            <h2>DelíciaDex</h2>
            <div className={styles.counter}>
              {encounteredCount}/{entries.length} encontrados
            </div>
          </div>

          <div className={styles.filters}>
            <label className={styles.filterField}>
              <span className={styles.filterLabel}>Tipagem</span>
              <select
                value={elementFilter}
                onChange={(e) =>
                  setElementFilter(e.target.value as ElementType | "all")
                }
              >
                <option value="all">Todas tipagens</option>
                {ELEMENTS.map((el) => (
                  <option key={el} value={el}>
                    {el}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.filterField}>
              <span className={styles.filterLabel}>Classe</span>
              <select
                value={classFilter}
                onChange={(e) =>
                  setClassFilter(e.target.value as NPCClass | "all")
                }
              >
                <option value="all">Todas classes</option>
                {Object.keys(CLASS_DATA).map((cls) => (
                  <option key={cls} value={cls}>
                    {CLASS_DATA[cls as NPCClass].label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        <div className={styles.content}>
          <aside className={styles.listPane}>
            <div className={styles.paneHeading}>
              <span>Criaturas</span>
              <span>{entries.length}</span>
            </div>

            <div className={styles.list} ref={listRef}>
              {entries.map((entry, index) => (
                <BestiaryCard
                  key={entry.npcType}
                  npcType={entry.npcType}
                  isAlfa={entry.isAlfa}
                  baseNpcType={entry.baseNpcType}
                  name={entry.name}
                  encountered={entry.encountered}
                  kills={entry.kills}
                  npcClass={entry.npcClass}
                  location={entry.location}
                  description={entry.description}
                  attacks={entry.attacks}
                  dropItems={entry.dropItems}
                  linkedTitles={entry.linkedTitles}
                  isSelected={index === selectedIndex}
                  variant="list"
                  index={index}
                  onSelect={() => setSelectedIndex(index)}
                />
              ))}

              {entries.length === 0 && (
                <p className={styles.emptyState}>
                  Nenhuma criatura com esses filtros.
                </p>
              )}
            </div>
          </aside>

          <section className={styles.detailPane}>
            <div className={styles.paneHeading}>
              <span>Ficha</span>
              {selected && (
                <span>#{String(visibleIndex + 1).padStart(2, "0")}</span>
              )}
            </div>

            <div className={styles.detailScroll}>
              {selected ? (
                <BestiaryCard
                  npcType={selected.npcType}
                  isAlfa={selected.isAlfa}
                  baseNpcType={selected.baseNpcType}
                  name={selected.name}
                  encountered={selected.encountered}
                  kills={selected.kills}
                  npcClass={selected.npcClass}
                  location={selected.location}
                  description={selected.description}
                  attacks={selected.attacks}
                  dropItems={selected.dropItems}
                  linkedTitles={selected.linkedTitles}
                  isSelected={false}
                  variant="detail"
                  index={visibleIndex}
                />
              ) : (
                <p className={styles.emptyState}>
                  Selecione uma criatura para ver a ficha.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
