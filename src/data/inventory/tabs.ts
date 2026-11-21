import { Backpack, Shirt } from "lucide-react";

export type InventorySection = "inventario" | "equipamentos";

export const INVENTORY_SECTIONS: InventorySection[] = [
  "inventario",
  "equipamentos",
];
export const INVENTORY_SECTION_COUNT = INVENTORY_SECTIONS.length;

export const INVENTORY_SECTION_LABELS: Record<InventorySection, string> = {
  inventario: "Inventário",
  equipamentos: "Equipamentos",
};

export const INVENTORY_SECTION_ICONS = {
  inventario: Backpack,
  equipamentos: Shirt,
};
