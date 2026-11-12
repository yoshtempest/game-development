import { CANTINA_ROUTES } from "@/scenes/shared/routes";

export const CHAPTER_SCREEN_DURATION_MS = 3000;

export type ChapterId = "one";

export type Chapter = {
  id: ChapterId;
  title: string;
  nextRoute: string;
};

export const CHAPTERS: Record<ChapterId, Chapter> = {
  one: {
    id: "one",
    title: "Capítulo 1 - O começo do desastre",
    nextRoute: CANTINA_ROUTES.ONE,
  },
};

export function isChapterId(value: string | undefined): value is ChapterId {
  return value !== undefined && value in CHAPTERS;
}

export function getChapter(id: string | undefined): Chapter | null {
  return isChapterId(id) ? CHAPTERS[id] : null;
}

/**
 * Flag que marca o início de cada capítulo. O capítulo atual é derivado do
 * estado que o save já guarda, em vez de uma chave de save nova que
 * precisaria entrar em `GAME_STATE_KEYS` e migrar saves antigos.
 */
export const CHAPTER_START_FLAGS: Record<ChapterId, FlagId> = {
  one: "chapterOne",
};

/** Ordem cronológica dos capítulos: o mais avançado com flag é o atual. */
export const CHAPTER_ORDER: readonly ChapterId[] = ["one"];

/**
 * Nome do arquivo de fundo da Home por capítulo, dentro de
 * `public/assets/cenarios/home/`. Guarda só o nome porque a pasta é resolvida
 * pelo helper `cenariosPath`. Capítulo sem entrada usa o fundo padrão da Home;
 * capítulo novo entra aqui junto com o `ChapterId` (ex.: `two: "chapter2.svg"`).
 */
export const HOME_BACKGROUND_FILES: Partial<Record<ChapterId, string>> = {
  one: "chapter1.svg",
};
