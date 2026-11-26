import type { NPCClass } from "@/data/npc";

type DropItem = {
  name: string;
  chance: string;
};

export type Props = {
  npcType: string;
  name: string;
  encountered: boolean;
  kills: number;
  npcClass: NPCClass | null;
  location: string;
  description: string;
  attacks: string[];
  dropItems: DropItem[];
  linkedTitles: string[];
  isSelected: boolean;
  baseNpcType?: string;
  isAlfa?: boolean;
  variant?: "list" | "detail";
  index?: number;
  onSelect?: () => void;
};