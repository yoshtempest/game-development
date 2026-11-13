import type { NavigateFunction } from "react-router";
import { sceneBackgrounds } from "@/data/scene/background";
import { backgroundAudioPath } from "@/utils/paths";

export type BattleCtx = {
  setFlag: (flag: FlagId) => void;
  navigate: NavigateFunction;
};

export type BattleConfig = {
  npcType: string;
  redirectTo?: string;
  onVictory?: (ctx: BattleCtx) => void;
  victoryDescription: string;
  background: string;
  audioSrc: string;
  introAudioSrc?: string;
};

export function getBattleBackgroundFromRoute(route: string): string {
  if (route.startsWith("/hall/hell")) return sceneBackgrounds.HellRoomBattle;
  if (route.startsWith("/hall/jailson")) {
    return sceneBackgrounds.JailsonHallBattle;
  }
  if (route.startsWith("/hall")) return sceneBackgrounds.HallCenterBattle;
  if (route.startsWith("/cantina")) return sceneBackgrounds.CantinaBattle;
  if (route.startsWith("/cafeteria")) return sceneBackgrounds.CafeteriaBattle;
  if (route.startsWith("/library")) return sceneBackgrounds.LibraryBattle;
  if (route.startsWith("/pcroom")) return sceneBackgrounds.PcRoomBattle;
  if (route.startsWith("/hellroom")) return sceneBackgrounds.HellRoomBattle;
  if (route.startsWith("/footballcourt")) {
    return sceneBackgrounds.FootballCourtBattle;
  }
  if (route.startsWith("/brodiclass")) {
    return sceneBackgrounds.BrodiClassBattle;
  }
  return "";
}

export const BATTLE_CONFIGS: Record<string, BattleConfig> = {
  cafeteria: {
    npcType: "deise",
    redirectTo: "/cafeteria/one",
    onVictory: ({ setFlag }) => {
      setFlag("deise");
    },
    victoryDescription: "Você derrotou Deise, a Lich imortal",
    background: sceneBackgrounds.CafeteriaBattle,
    audioSrc: backgroundAudioPath("/battle/DarkSouls.m4a"),
    introAudioSrc: "/battle/onePunch.mp3",
  },
  cantina: {
    npcType: "jhowsimar",
    redirectTo: "/cantina/one",
    onVictory: ({ setFlag }) => {
      setFlag("jhowsimar");
    },
    victoryDescription: "Você derrotou 'Jhow Simar, o Vigia'",
    background: sceneBackgrounds.CantinaBattle,
    audioSrc: backgroundAudioPath("/battle/StreetFighter5KenTheme.m4a"),
  },
  hellroom: {
    npcType: "maugrelo",
    redirectTo: "/hellroom/three",
    onVictory: ({ setFlag }) => {
      setFlag("maugrelo");
    },
    victoryDescription:
      "Você derrotou Maugrelo, mas ele parece ter gostado de apanhar?",
    background: sceneBackgrounds.HellRoomBattle,
    audioSrc: backgroundAudioPath(
      "/battle/GuiltyGear/MaysThemeBlueWaterSky.mp3",
    ),
  },
  brodiclass: {
    npcType: "srGuaxinim",
    redirectTo: "/brodiclass/one",
    onVictory: ({ setFlag }) => {
      setFlag("srGuaxinim");
      setFlag("srGuaxinimUnlocked");
    },
    victoryDescription:
      "Você derrotou Sr.Guaxinim e se livrou momentaneamente da fúria de Baal.",
    background: sceneBackgrounds.BrodiClassBattle,
    audioSrc: backgroundAudioPath("/battle/SpiderDance.m4a"),
  },
  footballCourt: {
    npcType: "neimito",
    redirectTo: "/footballcourt/one",
    onVictory: ({ setFlag }) => {
      setFlag("neimito");
    },
    victoryDescription: "Você derrotou 'Neimito, o mestre do calor'",
    background: sceneBackgrounds.FootballCourtBattle,
    audioSrc: backgroundAudioPath("/battle/StreetFighter5KenTheme.m4a"),
  },
  hallJailson: {
    npcType: "slimita",
    redirectTo: "/hall/jailson-two",
    onVictory: ({ setFlag }) => {
      setFlag("slimita");
    },
    victoryDescription: "Você derrotou Slimita, a Paquera de Jailson",
    background: sceneBackgrounds.JailsonHallBattle,
    audioSrc: backgroundAudioPath("/battle/SpiderDance.m4a"),
  },
  hallCenter: {
    npcType: "planetarySisters",
    redirectTo: "/hall/center-two",
    onVictory: ({ setFlag }) => {
      setFlag("planetarySisters");
    },
    victoryDescription:
      "Você derrotou as Irmãs Planetárias e agora pode passar",
    background: sceneBackgrounds.HallCenterBattle,
    audioSrc: backgroundAudioPath("/battle/KickBack.mp3"),
  },
  hallPandemony: {
    npcType: "maurao",
    redirectTo: "/hall/pandemony/two",
    onVictory: ({ setFlag }) => {
      setFlag("maurao");
    },
    victoryDescription: "Você salvou Maurão da loucura",
    background: sceneBackgrounds.HallCenterBattle,
    audioSrc: backgroundAudioPath("/battle/KickBack.mp3"),
    introAudioSrc: "/battle/onePunchGuitar.mp3",
  },
  pcroomOne: {
    npcType: "hungryDeath",
    redirectTo: "/pcroom/two",
    onVictory: ({ setFlag }) => {
      setFlag("hungryDeath");
    },
    victoryDescription: "Você derrotou um morto de fome!",
    background: sceneBackgrounds.PcRoomBattle,
    audioSrc: backgroundAudioPath("/battle/StreetFighter5KenTheme.m4a"),
  },
  pcroomTwo: {
    npcType: "vandinhaFragment",
    redirectTo: "/pcroom/four",
    onVictory: ({ setFlag }) => {
      setFlag("vandinhaFragment");
    },
    victoryDescription: "Você derrotou um fragmento de Vandinha",
    background: sceneBackgrounds.PcRoomBattle,
    audioSrc: backgroundAudioPath("/battle/StreetFighter5KenTheme.m4a"),
  },
  pcroomThree: {
    npcType: "hungryKing",
    redirectTo: "/pcroom/seven",
    onVictory: ({ setFlag }) => {
      setFlag("hungryKing");
      setFlag("samurionUnlocked");
    },
    victoryDescription:
      "Você salvou Samurion de seu próprio culto de mortos de fome",
    background: sceneBackgrounds.PcRoomBattle,
    audioSrc: backgroundAudioPath("/battle/StreetFighter5KenTheme.m4a"),
  },
  goat: {
    npcType: "goat",
    onVictory: ({ navigate }) => {
      void navigate(-1);
    },
    victoryDescription: "Você derrotou um bode!",
    background: sceneBackgrounds.CantinaBattle,
    audioSrc: backgroundAudioPath("/battle/StreetFighter5KenTheme.m4a"),
  },
  hungry: {
    npcType: "hungryDeath",
    onVictory: ({ navigate }) => {
      void navigate(-1);
    },
    victoryDescription: "Você derrotou 'Jhow Simar, o Vigia'",
    background: sceneBackgrounds.LibraryBattle,
    audioSrc: backgroundAudioPath("/battle/OriginalConcept.mp3"),
  },
  jhowsimar: {
    npcType: "jhowsimar",
    onVictory: ({ navigate }) => {
      void navigate(-1);
    },
    victoryDescription: "Você derrotou 'Jhow Simar, o Vigia'",
    background: sceneBackgrounds.CantinaBattle,
    audioSrc: backgroundAudioPath("/battle/StreetFighter5KenTheme.m4a"),
  },
  hungryDog: {
    npcType: "hungryDog",
    onVictory: ({ navigate }) => {
      void navigate(-1);
    },
    victoryDescription: "Você derrotou um cão morto de fome!",
    background: sceneBackgrounds.FootballCourtBattle,
    audioSrc: backgroundAudioPath("/battle/StreetFighter5KenTheme.m4a"),
  },
  piupiu: {
    npcType: "piupiu",
    onVictory: ({ navigate }) => {
      void navigate(-1);
    },
    victoryDescription: "Você derrotou um Pinto!",
    background: sceneBackgrounds.CafeteriaBattle,
    audioSrc: backgroundAudioPath("/battle/StreetFighter5KenTheme.m4a"),
  },
  rice: {
    npcType: "rice",
    onVictory: ({ navigate }) => {
      void navigate(-1);
    },
    victoryDescription: "Você derrotou um Bolinho de arroz!",
    background: sceneBackgrounds.CafeteriaBattle,
    audioSrc: backgroundAudioPath("/battle/StreetFighter5KenTheme.m4a"),
  },
  technoblade: {
    npcType: "technoblade",
    onVictory: ({ navigate }) => {
      void navigate(-1);
    },
    victoryDescription: "Você derrotou o rei",
    background: sceneBackgrounds.CantinaBattle,
    audioSrc: backgroundAudioPath("/battle/StreetFighter5KenTheme.m4a"),
  },
  vandinha: {
    npcType: "vandinhaFragment",
    onVictory: ({ navigate }) => {
      void navigate(-1);
    },
    background: sceneBackgrounds.PcRoomBattle,
    victoryDescription: "Você derrotou um fragmento de Vandinha",
    audioSrc: backgroundAudioPath("/battle/Jojo.m4a"),
  },
  training: {
    npcType: "dummy",
    onVictory: ({ navigate }) => {
      void navigate(-1);
    },
    victoryDescription: "Modo Treino",
    background: sceneBackgrounds.CombatTutorial,
    audioSrc: backgroundAudioPath("/battle/StreetFighter5KenTheme.m4a"),
  },
  pvp: {
    npcType: "dummy",
    redirectTo: "/jomasioentrance/one",
    victoryDescription: "Duelo PvP",
    background: sceneBackgrounds.CombatTutorial,
    audioSrc: backgroundAudioPath("/battle/StreetFighter5KenTheme.m4a"),
  },
  trueVandinha: {
    npcType: "trueVandinha",
    onVictory: ({ navigate }) => {
      void navigate(-1);
    },
    victoryDescription: "Você encontrou a Verdadeira Vandinha",
    background: sceneBackgrounds.PcRoomBattle,
    audioSrc: backgroundAudioPath("/battle/Jojo.m4a"),
  },
  evilMorty: {
    npcType: "evilMorty",
    onVictory: ({ navigate }) => {
      void navigate(-1);
    },
    victoryDescription: "Você derrotou o Evil Morty",
    background: sceneBackgrounds.PcRoomBattle,
    audioSrc: backgroundAudioPath("/battle/Jojo.m4a"),
  },
};

export const ROUTE_TO_BATTLE_KEY: Record<string, string> = {
  "/cafeteria/battle": "cafeteria",
  "/cantina/battle": "cantina",
  "/hellroom/battle": "hellroom",
  "/footballcourt/battle": "footballCourt",
  "/hall/jailson/battle": "hallJailson",
  "/hall/center/battle": "hallCenter",
  "/hall/pandemony/battle": "hallPandemony",
  "/brodiclass/battle": "brodiclass",
  "/pcroom/battle/one": "pcroomOne",
  "/pcroom/battle/two": "pcroomTwo",
  "/pcroom/battle/three": "pcroomThree",
  "/battle/goat": "goat",
  "/battle/hungry": "hungry",
  "/battle/hungryDog": "hungryDog",
  "/battle/jhowsimar": "jhowsimar",
  "/battle/piupiu": "piupiu",
  "/battle/rice": "rice",
  "/battle/technoblade": "technoblade",
  "/battle/vandinhafragment": "vandinha",
  "/battle/truevandinha": "trueVandinha",
  "/battle/evilmorty": "evilMorty",
  "/training": "training",
  "/battle/pvp": "pvp",
};
