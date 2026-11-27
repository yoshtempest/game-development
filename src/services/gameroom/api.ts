import type { GameRoom, GameRoomError, GameRoomGame } from "./types";

export class GameRoomApiError extends Error {
  status: number;
  code: string;
  details: Record<string, unknown>;
  field: string | null;

  constructor(status: number, error: GameRoomError) {
    super(error.detail);
    this.name = "GameRoomApiError";
    this.status = status;
    this.code = error.code;
    this.details = error.details ?? {};
    this.field = error.field ?? null;
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function buildUrl(baseUrl: string, path: string): string {
  const base = normalizeBaseUrl(baseUrl);
  return `${base}${path}`;
}

async function request<T>(baseUrl: string, path: string): Promise<T> {
  const res = await fetch(buildUrl(baseUrl, path), {
    headers: { Accept: "application/json" },
  });

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    if (!res.ok) {
      throw new GameRoomApiError(res.status, {
        detail: `Erro ${res.status} ao acessar gameroom`,
        code: "GAMEROOM_INVALID_RESPONSE",
      });
    }
    throw new GameRoomApiError(res.status, {
      detail: "Resposta inválida do gameroom",
      code: "GAMEROOM_INVALID_RESPONSE",
    });
  }

  if (!res.ok) {
    const err = json as Partial<GameRoomError> | null;
    throw new GameRoomApiError(res.status, {
      detail:
        typeof err?.detail === "string"
          ? err.detail
          : `Erro ${res.status} no gameroom`,
      code: typeof err?.code === "string" ? err.code : "GAMEROOM_ERROR",
      details:
        err?.details && typeof err.details === "object" ? err.details : {},
      field: typeof err?.field === "string" ? err.field : null,
    });
  }

  return json as T;
}

/** Lista os jogos configurados no gameroom. */
export function listGameRoomGames(baseUrl: string): Promise<GameRoomGame[]> {
  return request<GameRoomGame[]>(baseUrl, "/api/games");
}

/** Descreve um jogo pelo slug; 404 vira `GameRoomApiError` com `code`. */
export function getGameRoomGame(
  baseUrl: string,
  slug: string,
): Promise<GameRoomGame> {
  return request<GameRoomGame>(
    baseUrl,
    `/api/games/${encodeURIComponent(slug)}`,
  );
}

/** Consulta o estado público de uma sala antes do join via WebSocket. */
export function getGameRoomRoom(
  baseUrl: string,
  slug: string,
  code: string,
): Promise<GameRoom> {
  return request<GameRoom>(
    baseUrl,
    `/api/games/${encodeURIComponent(slug)}/rooms/${encodeURIComponent(code)}`,
  );
}

/**
 * Resolve o caminho WS do jogo para uma URL absoluta `ws(s)://`.
 * Aceita `baseUrl` http(s) ou ws(s); caminho relativo usa o host atual.
 */
export function resolveGameRoomWebSocketUrl(
  baseUrl: string,
  websocketPath: string,
): string {
  if (/^wss?:\/\//i.test(websocketPath)) return websocketPath;

  const normalizedBase = normalizeBaseUrl(baseUrl);
  if (/^https?:\/\//i.test(normalizedBase)) {
    const url = new URL(normalizedBase);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = websocketPath;
    url.search = "";
    url.hash = "";
    return url.toString();
  }

  if (/^wss?:\/\//i.test(normalizedBase)) {
    const url = new URL(normalizedBase);
    url.pathname = websocketPath;
    url.search = "";
    url.hash = "";
    return url.toString();
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = normalizedBase || window.location.host;
  const path = websocketPath.startsWith("/")
    ? websocketPath
    : `/${websocketPath}`;
  return `${protocol}//${host}${path}`;
}
