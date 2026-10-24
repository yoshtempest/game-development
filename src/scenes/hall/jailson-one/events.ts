export const jailsonOneEvents: SceneEvent[] = [
  {
    type: "conditional",
    condition: { notHasQuest: "give_orange_juice" },
    then: [{ type: "giveQuest", questId: "give_orange_juice" }],
  },
  {
    type: "conditional",
    condition: {
      hasItem: "orange_juice",
      hasQuest: "give_orange_juice",
    },
    then: [
      { type: "removeItem", itemId: "orange_juice" },
      { type: "giveQuest", questId: "create_map" },
      { type: "progressQuest", id: "give_orange_juice", value: 1 },
    ],
  },
  {
    type: "conditional",
    condition: { hasQuest: "create_map", hasItem: "desired_gear" },
    then: [
      { type: "removeItem", itemId: "desired_gear" },
      // Jailson entrega o mapa do Jorjão
      {
        type: "npcGiveItem",
        itemId: "jorjao_map",
        npcName: "Jailson",
        npcImage: "npc/jailson/right.svg",
      },
      { type: "progressQuest", id: "create_map", value: 1 },
    ],
  },
];
