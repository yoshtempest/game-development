import { useCallback, useEffect, useRef, useState } from "react";
import {
  getGameRoomGame,
  resolveGameRoomWebSocketUrl,
} from "@/services/gameroom/api";
import type { GameRoomWsMessage } from "@/services/gameroom/types";

export type GameRoomSocketStatus =
  | "idle"
  | "connecting"
  | "open"
  | "closed"
  | "error";

type GameRoomSocketListener = (msg: GameRoomWsMessage) => void;

type UseGameRoomSocketOptions = {
  /** URL base do gameroom (`https://...`) ou host relativo. */
  baseUrl: string | null;
  /** Slug do jogo no catálogo `/api/games`. */
  slug: string | null;
  /** Conecta automaticamente quando base/slug existem. Default: `true`. */
  autoConnect?: boolean;
  /** Máximo de tentativas de reconexão. Default: `6`. */
  maxRetries?: number;
  /** Envia join automaticamente ao abrir o socket. */
  join?: {
    roomId: string;
    playerId: string;
    playerName?: string;
    /** Campos extras do protocolo real (token, protocol_version, etc.). */
    payload?: Record<string, unknown>;
  } | null;
};

function parseSocketMessage(raw: unknown): GameRoomWsMessage | null {
  try {
    const msg = JSON.parse(String(raw)) as unknown;
    if (!msg || typeof msg !== "object") return null;
    const record = msg as Record<string, unknown>;
    if (typeof record.type !== "string") return null;
    return record as GameRoomWsMessage;
  } catch {
    return null;
  }
}

/**
 * Cliente WebSocket genérico para o tempest-gameroom.
 *
 * Descobre o `websocket_path` via `GET /api/games/{slug}` e abre a conexão.
 * O protocolo de mensagens não está no OpenAPI, então `send`/`subscribe` são
 * abertos; tipagem específica fica para quem integrar o fluxo real.
 */
export function useGameRoomSocket({
  baseUrl,
  slug,
  autoConnect = true,
  maxRetries = 6,
  join = null,
}: UseGameRoomSocketOptions) {
  const [status, setStatus] = useState<GameRoomSocketStatus>("idle");
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState<GameRoomWsMessage | null>(null);
  const [error, setError] = useState<unknown>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const shouldConnectRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectRequestRef = useRef(0);
  // `lastMessage` guarda só a última; eventos críticos devem usar `subscribe`.
  const listenersRef = useRef(new Map<string, Set<GameRoomSocketListener>>());

  const joinRef = useRef(join);
  joinRef.current = join;

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const closeSocket = useCallback(
    (sendLeave = false) => {
      clearReconnectTimer();
      const ws = wsRef.current;
      wsRef.current = null;
      if (ws) {
        if (sendLeave && ws.readyState === WebSocket.OPEN) {
          const currentJoin = joinRef.current;
          if (currentJoin) {
            try {
              ws.send(
                JSON.stringify({
                  type: "leaveRoom",
                  roomId: currentJoin.roomId,
                  playerId: currentJoin.playerId,
                }),
              );
            } catch {
              // ignore
            }
          }
        }
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        ws.onerror = null;
        if (
          ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING
        ) {
          ws.close();
        }
      }
      setConnected(false);
    },
    [clearReconnectTimer],
  );

  const disconnect = useCallback(() => {
    shouldConnectRef.current = false;
    connectRequestRef.current += 1;
    retriesRef.current = 0;
    setReconnecting(false);
    setStatus("idle");
    closeSocket(true);
  }, [closeSocket]);

  const connect = useCallback(async () => {
    if (!baseUrl || !slug) return;
    if (!shouldConnectRef.current) return;

    const requestId = ++connectRequestRef.current;
    setStatus("connecting");
    setError(null);

    try {
      const game = await getGameRoomGame(baseUrl, slug);
      if (
        requestId !== connectRequestRef.current ||
        !shouldConnectRef.current
      ) {
        return;
      }

      const url = resolveGameRoomWebSocketUrl(baseUrl, game.websocket_path);
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (wsRef.current !== ws) return;
        setConnected(true);
        setReconnecting(false);
        setStatus("open");
        setError(null);
        retriesRef.current = 0;

        const currentJoin = joinRef.current;
        if (currentJoin) {
          ws.send(
            JSON.stringify({
              type: "joinRoom",
              roomId: currentJoin.roomId,
              playerId: currentJoin.playerId,
              playerName: currentJoin.playerName ?? "Jogador",
              ...(currentJoin.payload ?? {}),
            }),
          );
        }
      };

      ws.onmessage = (event) => {
        if (wsRef.current !== ws) return;
        const msg = parseSocketMessage(event.data);
        if (!msg) return;
        setLastMessage(msg);
        const listeners = listenersRef.current.get(msg.type);
        if (listeners) {
          for (const listener of listeners) listener(msg);
        }
      };

      ws.onerror = () => {
        if (wsRef.current !== ws) return;
        setStatus("error");
      };

      ws.onclose = () => {
        if (wsRef.current !== ws) return;
        wsRef.current = null;
        setConnected(false);

        if (!shouldConnectRef.current) {
          setReconnecting(false);
          setStatus("closed");
          return;
        }

        if (retriesRef.current >= maxRetries) {
          setReconnecting(false);
          setStatus("closed");
          return;
        }

        setReconnecting(true);
        setStatus("connecting");
        const delay = Math.min(1000 * 2 ** retriesRef.current, 10000);
        retriesRef.current += 1;
        clearReconnectTimer();
        reconnectTimerRef.current = setTimeout(() => {
          void connect();
        }, delay);
      };
    } catch (err) {
      if (
        requestId !== connectRequestRef.current ||
        !shouldConnectRef.current
      ) {
        return;
      }
      setConnected(false);
      setError(err);
      setStatus("error");

      if (retriesRef.current >= maxRetries) {
        setReconnecting(false);
        setStatus("closed");
        return;
      }

      setReconnecting(true);
      const delay = Math.min(1000 * 2 ** retriesRef.current, 10000);
      retriesRef.current += 1;
      clearReconnectTimer();
      reconnectTimerRef.current = setTimeout(() => {
        void connect();
      }, delay);
    }
  }, [baseUrl, clearReconnectTimer, maxRetries, slug]);

  useEffect(() => {
    if (!autoConnect || !baseUrl || !slug) {
      disconnect();
      return;
    }

    shouldConnectRef.current = true;
    retriesRef.current = 0;
    void connect();

    return () => {
      disconnect();
    };
  }, [autoConnect, baseUrl, connect, disconnect, slug]);

  const send = useCallback((msg: GameRoomWsMessage) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
      return true;
    }
    return false;
  }, []);

  const subscribe = useCallback(
    (type: string, listener: GameRoomSocketListener) => {
      let listeners = listenersRef.current.get(type);
      if (!listeners) {
        listeners = new Set();
        listenersRef.current.set(type, listeners);
      }
      listeners.add(listener);
      return () => {
        listeners?.delete(listener);
        if (listeners?.size === 0) listenersRef.current.delete(type);
      };
    },
    [],
  );

  return {
    status,
    connected,
    reconnecting,
    error,
    lastMessage,
    send,
    subscribe,
    connect: () => {
      shouldConnectRef.current = true;
      retriesRef.current = 0;
      void connect();
    },
    disconnect,
  };
}
