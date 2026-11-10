import { useCallback, useEffect, useRef, useState } from "react";

export type BattleSocketMessage = {
  type: string;
  [key: string]: unknown;
};

const MAX_RETRIES = 6;

export function useBattleSocket(roomId: string | null, playerId: string | null) {
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState<BattleSocketMessage | null>(
    null,
  );
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const shouldConnectRef = useRef(true);

  const connect = useCallback(() => {
    if (!roomId || !playerId) return;
    if (!shouldConnectRef.current) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname;
    const port = "3001";
    const url = `${protocol}//${host}:${port}/ws`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setReconnecting(false);
      retriesRef.current = 0;
      ws.send(
        JSON.stringify({ type: "joinRoom", roomId, playerId, playerName: "Jogador" }),
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(String(event.data)) as BattleSocketMessage;
        setLastMessage(msg);
      } catch {
        // ignore
      }
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
      if (!shouldConnectRef.current) return;
      if (retriesRef.current >= MAX_RETRIES) {
        setReconnecting(false);
        return;
      }
      setReconnecting(true);
      const delay = Math.min(1000 * 2 ** retriesRef.current, 10000);
      retriesRef.current += 1;
      setTimeout(() => {
        if (shouldConnectRef.current) connect();
      }, delay);
    };

    ws.onerror = () => {
      // onclose will handle reconnect
    };
  }, [roomId, playerId]);

  useEffect(() => {
    shouldConnectRef.current = true;
    retriesRef.current = 0;
    connect();
    return () => {
      shouldConnectRef.current = false;
      const ws = wsRef.current;
      if (ws) {
        try {
          ws.send(
            JSON.stringify({ type: "leaveRoom", roomId, playerId }),
          );
        } catch {
          // ignore
        }
        ws.close();
        wsRef.current = null;
      }
      setConnected(false);
      setReconnecting(false);
    };
  }, [connect, roomId, playerId]);

  const send = useCallback((msg: BattleSocketMessage) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }, []);

  return { connected, reconnecting, send, lastMessage };
}