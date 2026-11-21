import { Backpack, Shirt } from "lucide-react";

export type InventorySection = "inventario" | "equipamentos";

export const INVENTORY_SECTIONS: InventorySection[] = [
  "inventario",
  "equipamentos",
];
export const INVENTORY_SECTION_COUNT = INVENTORY_SECTIONS.length;

/**
 * Colunas do grid do inventário. A navegação por teclado lê o mesmo valor que
 * o CSS (aplicado via inline style no `<ul>`), então mudar aqui não desalinha
 * setas e seleção.
 */
export const INVENTORY_GRID_COLUMNS = 5;

export const INVENTORY_SECTION_LABELS: Record<InventorySection, string> = {
  inventario: "Inventário",
  equipamentos: "Equipamentos",
};

export const INVENTORY_SECTION_ICONS = {
  inventario: Backpack,
  equipamentos: Shirt,
};
