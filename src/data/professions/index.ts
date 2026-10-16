import type { ProfessionInfo } from "@/utils/types/player/profession";

export const PROFESSIONS: ProfessionInfo[] = [
  {
    id: "alchemist",
    name: "Alquimista",
    npcName: "Janica",
    toolId: "weapon_cauldron",
    toolName: "Caldeirão",
    recipe: { hungry_essence: 3, rare_scale: 2 },
  },
  {
    id: "chef",
    name: "Cozinheiro",
    npcName: "Ellison e Rurin",
    toolId: "weapon_pan",
    toolName: "Rolo de Massa",
    recipe: { hungry_essence: 4 },
  },
  {
    id: "lumberjack",
    name: "Lenhador",
    npcName: "Jack, o Lenhador",
    toolId: "weapon_axe",
    toolName: "Rolo de Massa",
    recipe: { hungry_essence: 4 },
  },
  {
    id: "farmer",
    name: "Agricultor",
    npcName: "Cendeiro (Jovem)",
    toolId: "weapon_hoe",
    toolName: "Enxada",
    recipe: { hungry_essence: 5 },
  },
  {
    id: "fisher",
    name: "Pescador",
    npcName: "Um Cara Tranquilo",
    toolId: "weapon_fishing_rod",
    toolName: "Vara de Pesca",
    recipe: { hungry_essence: 4, rare_scale: 2 },
  },
  {
    id: "butcher",
    name: "Açougueiro",
    npcName: "Vikir, o caçador",
    toolId: "weapon_cleaver",
    toolName: "Cutelo",
    recipe: { goat_horn: 3, hungry_essence: 2 },
  },
  {
    id: "bodyBuilder",
    name: "BodyBuilder",
    npcName: "Daniel Park",
    toolId: "weapon_dumbbell",
    toolName: "Halter",
    recipe: { goat_horn: 4 },
  },
  {
    id: "mechanic",
    name: "Mecânico",
    npcName: "Binha",
    toolId: "weapon_adjustable_wrench",
    toolName: "Chave Inglesa",
    recipe: { goat_horn: 2, figurant_totem: 2 },
  },
  {
    id: "miner",
    name: "Mineiro",
    npcName: "Seo Joo-Heon",
    toolId: "weapon_pickaxe",
    toolName: "Picareta",
    recipe: { hungry_essence: 5, goat_horn: 2 },
  },
];

export function getProfessionByToolId(
  toolId: EquipmentId,
): ProfessionInfo | undefined {
  return PROFESSIONS.find((p) => p.toolId === toolId);
}

export function isProfessionTool(toolId: EquipmentId): boolean {
  return PROFESSIONS.some((p) => p.toolId === toolId);
}
