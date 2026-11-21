import { equipmentIconPath, navbarIconPath } from "@/utils/paths";

export const NAVBAR_OPTIONS = [
  { icon: navbarIconPath("player.svg"), label: "Jogador", screen: "player" },
  {
    icon: navbarIconPath("character.svg"),
    label: "Personagem",
    screen: "character",
    confirmSfx: "chooseYourCharacter",
  },
  { icon: navbarIconPath("status.svg"), label: "Status", screen: "status" },
  {
    icon: navbarIconPath("equipments.svg"),
    label: "Equipamentos",
    screen: "equipment",
  },
  {
    icon: navbarIconPath("backpack.svg"),
    label: "Mochila",
    screen: "inventory",
  },
  { icon: navbarIconPath("quests.svg"), label: "Missões", screen: "missions" },
  {
    icon: navbarIconPath("deliciaDex.svg"),
    label: "DelíciaDex",
    screen: "bestiary",
  },
  {
    icon: navbarIconPath("professions.svg"),
    label: "Profissões",
    screen: "professions",
  },
  { icon: navbarIconPath("titles.svg"), label: "Títulos", screen: "titles" },
  {
    icon: equipmentIconPath("pets.svg"),
    label: "Pets",
    screen: "pets",
  },
  { icon: navbarIconPath("saves.svg"), label: "Saves", screen: "saves" },
  {
    icon: navbarIconPath("configs.svg"),
    label: "Configurações",
    screen: "config",
  },
] as const;

export type MenuScreen = (typeof NAVBAR_OPTIONS)[number]["screen"];
