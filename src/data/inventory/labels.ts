/**
 * Filtros da aba Inventário. A barra mostra só o ícone — o espaço horizontal é
 * dos itens — e `label` sobrevive como título/aria-label para acessibilidade.
 *
 * `classLabel` dá o nome no singular usado na info do item selecionado quando
 * ele não pertence a nenhuma profissão. As profissões viraram um único filtro:
 * são poucos itens e nove botões só comprimiam o grid.
 */
export type InventoryFilter = {
  type: string;
  label: string;
  src: string;
  iconKind?: "item" | "navbar";
  classLabel?: string;
  separator?: boolean;
};

export const FILTER_LABELS: InventoryFilter[] = [
  { type: "all", label: "Todos", src: "all.svg" },
  { type: "chest", label: "Baús", src: "chests.svg", classLabel: "baú" },
  { type: "key", label: "Chaves", src: "keys.svg", classLabel: "chave" },
  {
    type: "consumable",
    label: "Poções",
    src: "potions.svg",
    classLabel: "poção",
  },
  { type: "food", label: "Comidas", src: "foods.svg", classLabel: "comida" },
  {
    type: "material",
    label: "Materiais",
    src: "materials.svg",
    classLabel: "material",
  },
  { type: "none", label: "Outros", src: "others.svg", classLabel: "outro" },
  {
    type: "teleport",
    label: "Teletransportes",
    src: "teleports.svg",
    classLabel: "teletransporte",
  },
  { type: "card", label: "Cartas", src: "cards.svg", classLabel: "carta" },
  { type: "map", label: "Mapas", src: "maps.svg", classLabel: "mapa" },
  {
    type: "profession",
    label: "Profissões",
    src: "professions.svg",
    iconKind: "navbar",
    separator: true,
  },
];
