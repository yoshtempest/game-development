import { useCallback, useEffect, useRef, useState } from "react";

export type BattleSocketMessage = {
  type: string;
  [key: string]: unknown;
};

export function useBattleSocket(roomId: string | null, playerId: string | null) {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<BattleSocketMessage | null>(
    null,
  );
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId || !playerId) return;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname;
    const port = "3001";
    const url = `${protocol}//${host}:${port}/ws`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
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

    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    return () => {
      try {
        ws.send(JSON.stringify({ type: "leaveRoom", roomId, playerId }));
      } catch {
        // ignore
      }
      ws.close();
      wsRef.current = null;
      setConnected(false);
    };
  }, [roomId, playerId]);

  const send = useCallback((msg: BattleSocketMessage) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }, []);

  return { connected, send, lastMessage };
}