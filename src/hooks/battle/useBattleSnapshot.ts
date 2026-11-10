import { useEffect, useRef, useState } from "react";
import type { BattleSocketMessage } from "@/hooks/useBattleSocket";

export type BattleSnapshot = {
  t: number;
  player?: { x: number; y: number; hp: number; state?: string };
  npc?: { x: number; y: number; hp: number; state?: string; phase?: number };
};

export function useBattleSnapshot({
  isHost,
  send,
  lastMessage,
  getState,
}: {
  isHost: boolean;
  send: (msg: BattleSocketMessage) => void;
  lastMessage: BattleSocketMessage | null;
  getState: () => BattleSnapshot;
}) {
  const [snapshot, setSnapshot] = useState<BattleSnapshot | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Host: envia snapshot periodicamente
  useEffect(() => {
    if (!isHost) return;
    intervalRef.current = setInterval(() => {
      send({ type: "battleSnapshot", ...(getState() as object) });
    }, 100);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isHost, send, getState]);

  // Guest: recebe snapshot
  useEffect(() => {
    if (isHost) return;
    if (!lastMessage || lastMessage.type !== "battleSnapshot") return;
    setSnapshot(lastMessage as unknown as BattleSnapshot);
  }, [isHost, lastMessage]);

  return { snapshot, isHost };
}