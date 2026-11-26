import type { NavigateFunction } from "react-router";
import { sceneBackgrounds } from "@/data/scene/background";
import { backgroundAudioPath } from "@/utils/paths";
import type { BattleMapConfig } from "@/utils/types/maps/battle";
import {
  CENTER_ROCK_MAP,
  ROCKY_FIELD_MAP,
  TWIN_PLATFORMS_MAP,
} from "@/data/battle/maps";

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
  /**
   * Pedras/plataformas da arena (`data/battle/maps.ts`). Ausente = arena
   * plana de sempre. Só entra em battle de NPC terrestre: boss que voa,
   * cava ou teleporta controla o próprio `y` e ignoraria o terreno.
   */
  map?: BattleMapConfig;
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
  if (route.startsWith("/director")) return sceneBackgrounds.DirectorBattle;
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
    map: ROCKY_FIELD_MAP,
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
    map: CENTER_ROCK_MAP,
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
  /**
   * Denis (#301) ateia fogo na papelada da diretoria: a arena queima a batalha
   * inteira (`ARENA_BURN_FRACTION`). Volta para a diretoria ao vencer.
   */
  director: {
    npcType: "denis",
    redirectTo: "/director/one",
    onVictory: ({ setFlag }) => {
      setFlag("denis");
    },
    victoryDescription: "Você apagou o fogo e o Denis, mané como sempre",
    background: sceneBackgrounds.DirectorBattle,
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
    map: ROCKY_FIELD_MAP,
  },
  vigiaJoao: {
    npcType: "vigiaJoao",
    onVictory: ({ setFlag, navigate }) => {
      setFlag("vigiaJoao");
      void navigate(-1);
    },
    victoryDescription: "Você derrotou 'João, o Vigia da Sala dos Professores'",
    background: sceneBackgrounds.JailsonHallBattle,
    audioSrc: backgroundAudioPath("/battle/StreetFighter5KenTheme.m4a"),
  },
  vigiaJoaquim: {
    npcType: "vigiaJoaquim",
    onVictory: ({ setFlag, navigate }) => {
      setFlag("vigiaJoaquim");
      void navigate(-1);
    },
    victoryDescription: "Você derrotou 'Joaquim, o Vigia da Biblioteca'",
    background: sceneBackgrounds.LibraryBattle,
    audioSrc: backgroundAudioPath("/battle/StreetFighter5KenTheme.m4a"),
  },
  vigiaLando: {
    npcType: "vigiaLando",
    onVictory: ({ setFlag, navigate }) => {
      setFlag("vigiaLando");
      void navigate(-1);
    },
    victoryDescription: "Você derrotou 'Landô, o Vigia da Passagem Secreta'",
    background: sceneBackgrounds.LibraryBattle,
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
    map: TWIN_PLATFORMS_MAP,
  },
  manim: {
    npcType: "manim",
    onVictory: ({ setFlag, navigate }) => {
      setFlag("manim");
      void navigate(-1);
    },
    victoryDescription: "Você derrotou Manim, tá bom?",
    background: sceneBackgrounds.HallCenterBattle,
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
    map: TWIN_PLATFORMS_MAP,
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
  rickToxico: {
    npcType: "rickToxico",
    onVictory: ({ navigate }) => {
      void navigate(-1);
    },
    victoryDescription: "Você derrotou o Rick Tóxico",
    background: sceneBackgrounds.ToxicSwampBattle,
    audioSrc: backgroundAudioPath("/battle/StreetFighter5KenTheme.m4a"),
  },
  mahoraga: {
    npcType: "mahoraga",
    onVictory: ({ navigate }) => {
      void navigate(-1);
    },
    victoryDescription:
      "Você exorcizou o Mahoraga antes que a roda girasse de novo",
    background: sceneBackgrounds.CafeteriaBattle,
    audioSrc: backgroundAudioPath("/battle/DarkSouls.m4a"),
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
  rickPrime: {
    npcType: "rickPrime",
    onVictory: ({ navigate }) => {
      void navigate(-1);
    },
    victoryDescription: "Rick Prime perdeu a paciência... e a luta.",
    background: sceneBackgrounds.CombatTutorial,
    audioSrc: backgroundAudioPath("/battle/StreetFighter5KenTheme.m4a"),
  },
};

export const ROUTE_TO_BATTLE_KEY: Record<string, string> = {
  "/cafeteria/battle": "cafeteria",
  "/cantina/battle": "cantina",
  "/hellroom/battle": "hellroom",
  "/director/battle": "director",
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
  "/battle/vigiaJoao": "vigiaJoao",
  "/battle/vigiaJoaquim": "vigiaJoaquim",
  "/battle/vigiaLando": "vigiaLando",
  "/battle/piupiu": "piupiu",
  "/battle/manim": "manim",
  "/battle/rice": "rice",
  "/battle/technoblade": "technoblade",
  "/battle/vandinhafragment": "vandinha",
  "/battle/truevandinha": "trueVandinha",
  "/battle/ricktoxico": "rickToxico",
  "/battle/evilmorty": "evilMorty",
  "/battle/mahoraga": "mahoraga",
  "/training": "training",
  "/battle/pvp": "pvp",
  "/battle/rickprime": "rickPrime",
};
