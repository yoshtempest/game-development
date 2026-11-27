import { useCallback, useEffect, useState } from "react";
import {
  getGameRoomGame,
  getGameRoomRoom,
  listGameRoomGames,
} from "@/services/gameroom/api";
import type { GameRoom, GameRoomGame } from "@/services/gameroom/types";

type UseGameRoomOptions = {
  baseUrl: string | null;
  slug: string | null;
  /** Código da sala para consulta pública; opcional. */
  code?: string | null;
  /** Faz o fetch inicial automaticamente. Default: `true`. */
  autoFetch?: boolean;
};

/**
 * Estado REST do gameroom: catálogo do jogo e, opcionalmente, sala pública.
 * Não abre WebSocket; para tempo real use `useGameRoomSocket`.
 */
export function useGameRoom({
  baseUrl,
  slug,
  code = null,
  autoFetch = true,
}: UseGameRoomOptions) {
  const [game, setGame] = useState<GameRoomGame | null>(null);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const refresh = useCallback(async () => {
    if (!baseUrl || !slug) {
      setGame(null);
      setRoom(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [nextGame, nextRoom] = await Promise.all([
        getGameRoomGame(baseUrl, slug),
        code ? getGameRoomRoom(baseUrl, slug, code) : Promise.resolve(null),
      ]);
      setGame(nextGame);
      setRoom(nextRoom);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, code, slug]);

  useEffect(() => {
    if (!autoFetch) return;
    void refresh();
  }, [autoFetch, refresh]);

  return { game, room, loading, error, refresh, setRoom };
}

type UseGameRoomCatalogOptions = {
  baseUrl: string | null;
  autoFetch?: boolean;
};

/** Lista os jogos do gameroom. Útil para lobby/debug. */
export function useGameRoomCatalog({
  baseUrl,
  autoFetch = true,
}: UseGameRoomCatalogOptions) {
  const [games, setGames] = useState<GameRoomGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const refresh = useCallback(async () => {
    if (!baseUrl) {
      setGames([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setGames(await listGameRoomGames(baseUrl));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    if (!autoFetch) return;
    void refresh();
  }, [autoFetch, refresh]);

  return { games, loading, error, refresh };
}
