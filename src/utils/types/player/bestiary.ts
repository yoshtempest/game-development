export type NpcLocation =
  | "Jomasio"
  | "Bocaina"
  | "Lagoa Grande"
  | "Cachoeiras"
  | "Barragem"
  | "Tanque dos Crávos"
  | "Lagoa do Canto";

export type BestiaryEntryData = {
  npcType: string;
  name: string;
  description: string;
  location: NpcLocation;
  attacks: string[];
  isAlfa?: boolean;
  baseNpcType?: string;
};

export type BestiarySaveEntry = {
  encountered: boolean;
  kills: number;
};

export type BestiarySaveData = Record<string, BestiarySaveEntry>;
