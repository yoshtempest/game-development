export type Props = {
  npcType: string;
  npcLevel: number;
  npcClass:
    "common" | "rare" | "epic" | "boss" | "legendary" | "supreme" | "omega";
  difficulty: NpcDifficulty;
  npcPhase: number;
  npcStatMultiplier?: number;
  npcArmorBonus?: number;
};
