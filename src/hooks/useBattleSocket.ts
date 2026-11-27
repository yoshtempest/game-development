import { useCallback, useEffect, useRef, useState } from "react";
import {
  acquireGameRoomSocket,
  sendGameRoomMessage,
  subscribeGameRoomAny,
  subscribeGameRoomStatus,
} from "@/services/gameroom/socket";

export type BattleSocketMessage = {
  type: string;
  [key: string]: unknown;
};

type BattleSocketListener = (msg: BattleSocketMessage) => void;

/**
 * Socket de sala/batalha via tempest-gameroom.
 * Usa socket compartilhado por `roomId` para evitar múltiplas conexões
 * derrubarem a sessão anterior no gameroom.
 */
export function useBattleSocket(
  roomId: string | null,
  playerId: string | null,
) {
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState<BattleSocketMessage | null>(
    null,
  );

  const entryRef = useRef<ReturnType<typeof acquireGameRoomSocket> | null>(null);
  const listenersRef = useRef(new Map<string, Set<BattleSocketListener>>());

  useEffect(() => {
    if (!roomId || !playerId) {
      setConnected(false);
      setReconnecting(false);
      return;
    }

    const acquired = acquireGameRoomSocket(roomId);
    entryRef.current = acquired;
    const { entry } = acquired;

    const syncStatus = () => {
      setConnected(entry.connected);
      setReconnecting(entry.reconnecting);
    };
    syncStatus();
    const offStatus = subscribeGameRoomStatus(entry, syncStatus);
    const offAny = subscribeGameRoomAny(entry, (msg) => {
      setLastMessage(msg);
      const listeners = listenersRef.current.get(msg.type);
      if (listeners) for (const l of listeners) l(msg);
    });

    return () => {
      offStatus();
      offAny();
      entryRef.current = null;
      acquired.release(false);
    };
  }, [roomId, playerId]);

  const send = useCallback((msg: BattleSocketMessage) => {
    const acquired = entryRef.current;
    if (!acquired) return;
    sendGameRoomMessage(acquired.entry, msg);
  }, []);

  const subscribe = useCallback(
    (type: string, listener: BattleSocketListener) => {
      let listeners = listenersRef.current.get(type);
      if (!listeners) {
        listeners = new Set();
        listenersRef.current.set(type, listeners);
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) listenersRef.current.delete(type);
      };
    },
    [],
  );

  return {
    connected,
    reconnecting,
    lastMessage,
    send,
    subscribe,
  };
}
