import { ITEMS } from "@/data/items";
import { PROFESSIONS } from "@/data/professions";
import { getProfessionBadge } from "@/data/professions/badge";
import { PROFESSION_ITEMS } from "@/data/professions/professionItems";
import { itemFilterPath } from "@/utils/paths";
import { FILTER_LABELS } from "./labels";

export type ItemOriginInfo = {
  /** Ícone da profissão (badge) ou da classe (ícone do filtro). */
  icon: string;
  /** `profissão: X` ou `classe: X`, pronto para exibição. */
  label: string;
};

/**
 * A origem é derivada dos dados existentes em vez de duplicada em cada item:
 * `PROFESSION_ITEMS` já é a fonte de verdade de qual item pertence a qual
 * profissão, e `type` já classifica o item quando não há profissão.
 */
export function isProfessionItem(itemId: ItemId): boolean {
  return PROFESSIONS.some((profession) =>
    PROFESSION_ITEMS[profession.id]?.has(itemId),
  );
}

export function getItemOriginInfo(itemId: ItemId): ItemOriginInfo | null {
  const profession = PROFESSIONS.find((candidate) =>
    PROFESSION_ITEMS[candidate.id]?.has(itemId),
  );
  if (profession) {
    return {
      icon: getProfessionBadge(profession.id),
      label: `profissão: ${profession.name}`,
    };
  }

  const itemData = ITEMS[itemId];
  const type = itemData && "type" in itemData ? itemData.type : undefined;
  if (typeof type !== "string") return null;

  const filter = FILTER_LABELS.find(
    (candidate) => candidate.type === type && candidate.classLabel,
  );
  if (!filter?.classLabel) return null;

  return {
    icon: itemFilterPath(filter.src),
    label: `classe: ${filter.classLabel}`,
  };
}
