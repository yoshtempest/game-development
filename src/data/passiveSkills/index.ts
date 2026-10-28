import type {
  PassiveSkillNode,
  CharacterSkillTree,
} from "@/utils/types/player/passiveSkills";

const BASE_SKILLS: PassiveSkillNode[] = [
  {
    id: "dash",
    name: "Dash",
    description: "Deslize rapidamente com um duplo toque direcional",
    icon: "Zap",
    levelRequired: 10,
  },
];

const CHARACTER_SKILLS: Partial<Record<CharacterId, PassiveSkillNode[]>> = {
  marshadow: [
    {
      id: "doubleJump",
      name: "Pulo Duplo",
      description: "Salte uma segunda vez enquanto estiver no ar",
      icon: "ArrowUp",
      levelRequired: 20,
    },
  ],
  samurion: [
    {
      id: "berserk",
      name: "Berserk",
      description:
        "Quanto menor a vida, maior o dano causado — até o dobro com 10% de HP",
      icon: "Flame",
      levelRequired: 20,
    },
  ],
};

export function getSkillTree(characterId: CharacterId): CharacterSkillTree {
  const extra = CHARACTER_SKILLS[characterId] ?? [];
  return {
    characterId,
    skills: [...BASE_SKILLS, ...extra],
  };
}
