import { useEffect, useRef, useState } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
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
  // `getState` é recriado a cada render do chamador. Sem o ref, o effect
  // reiniciava o intervalo a cada frame e ele nunca chegava a disparar.
  const getStateRef = useLatestRef(getState);

  // Host: envia snapshot periodicamente
  useEffect(() => {
    if (!isHost) return;
    intervalRef.current = setInterval(() => {
      send({ type: "battleSnapshot", ...(getStateRef.current() as object) });
    }, 100);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isHost, send, getStateRef]);

  // Guest: recebe snapshot
  useEffect(() => {
    if (isHost) return;
    if (!lastMessage || lastMessage.type !== "battleSnapshot") return;
    setSnapshot(lastMessage as unknown as BattleSnapshot);
  }, [isHost, lastMessage]);

  return { snapshot, isHost };
}