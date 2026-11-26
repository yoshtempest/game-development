import type { RickPrimePodcastEpisode } from "@/data/dialogues/rickPrimePodcast";

/**
 * Progresso salvo dos encontros com o Rick Prime.
 *
 * `encounters` conta quantas vezes o jogador falou com ele e `heard` guarda
 * o `id` dos episódios já ouvidos — é o `heard` que garante que ele nunca
 * repete uma fala, mesmo depois de recarregar o jogo.
 */
export type RickPrimeProgress = {
  encounters: number;
  heard: number[];
};

export const NO_RICK_PRIME_PROGRESS: RickPrimeProgress = {
  encounters: 0,
  heard: [],
};

/**
 * Episódios `1..10` (a pasta `oneToTen`) ficam liberados desde o primeiro
 * encontro; do 11 em diante o Rick Prime só fala depois de o jogador já ter
 * cruzado com ele mais de {@link RICK_PRIME_UNLOCK_ENCOUNTERS} vezes
 * (issue #442). Dez falas livres cobrem com folga os cinco primeiros
 * encontros, então o sorteio nunca fica sem opção antes do desbloqueio.
 */
export const RICK_PRIME_FREE_EPISODES = 10;

export const RICK_PRIME_UNLOCK_ENCOUNTERS = 5;

/**
 * Diz se o episódio pode ser falado no encontro atual. `encounters` é o
 * número de encontros **anteriores** a este, por isso o desbloqueio usa
 * `>=`: com 5 encontros passados, o atual já é o sexto ("mais de 5").
 */
export function isRickPrimeEpisodeUnlocked(
  episode: RickPrimePodcastEpisode,
  encounters: number,
): boolean {
  return (
    episode.id <= RICK_PRIME_FREE_EPISODES ||
    encounters >= RICK_PRIME_UNLOCK_ENCOUNTERS
  );
}

/**
 * Sorteia o próximo episódio inédito e liberado.
 *
 * O sorteio (em vez da ordem do array) é o que dá sentido à trava: com
 * ordem fixa os cinco primeiros encontros seriam sempre 1..5 e a regra de
 * "só depois de 5 encontros" nunca mudaria nada. `null` significa que o
 * Rick Prime não tem mais o que dizer — é o gatilho da luta.
 *
 * @param random injetável para o sorteio ser determinístico fora do jogo.
 */
export function pickRickPrimeEpisode(
  progress: RickPrimeProgress,
  episodes: readonly RickPrimePodcastEpisode[],
  random: () => number = Math.random,
): RickPrimePodcastEpisode | null {
  const heard = new Set(progress.heard);
  const available = episodes.filter(
    (episode) =>
      !heard.has(episode.id) &&
      isRickPrimeEpisodeUnlocked(episode, progress.encounters),
  );
  if (available.length === 0) return null;
  return available[Math.floor(random() * available.length)] ?? null;
}

/**
 * Save antigo ou corrompido volta ao início em vez de quebrar o sorteio:
 * `heard` fora do formato faria o Rick Prime repetir falas ou nunca lutar.
 */
export function normalizeRickPrimeProgress(
  data: RickPrimeProgress,
): RickPrimeProgress {
  if (!data || typeof data !== "object") return NO_RICK_PRIME_PROGRESS;
  const encounters =
    typeof data.encounters === "number" && data.encounters >= 0
      ? data.encounters
      : 0;
  const heard = Array.isArray(data.heard)
    ? data.heard.filter((id): id is number => typeof id === "number")
    : [];
  return { encounters, heard };
}
