import { useCallback, useEffect, useState } from "react";

import { slotKey } from "@/services/save/slotManager";
import {
  getMahoragaEventState,
  toDayKey,
} from "@/gameRules/events/mahoragaEvent";
import type { MahoragaEventState } from "@/gameRules/events/mahoragaEvent";
import {
  MAHORAGA_EVENT_KEY,
  MAHORAGA_NOTIFIED_KEY,
} from "@/data/storageKeys";
import { showLocalNotification } from "@/utils/notifications/showLocalNotification";

/**
 * Intervalo de reavaliação do relógio. 30s basta: a janela de 10 minutos do
 * Mahoraga tolera esse atraso e um tick por segundo seria render à toa no
 * app inteiro (o hook vive no `GameApp`).
 */
const MAHORAGA_EVENT_TICK_MS = 30 * 1000;

function readLastFoughtDay(): string | null {
  return localStorage.getItem(slotKey(MAHORAGA_EVENT_KEY));
}

/**
 * Estado do evento diário do Mahoraga + o gatilho que gasta a aparição do dia.
 *
 * A aparição é marcada como gasta **no início** do encontro (`markFought`),
 * não na vitória: fugir ou perder também consome o Mahoraga do dia, que é o
 * "1 vez por dia" da issue #444. Decisão para revisar.
 *
 * @param notify quando `true`, avisa o jogador com notificação do sistema na
 *   transição para `active`. Só o `GameApp` passa `true`; a chave
 *   `MAHORAGA_NOTIFIED_KEY` (global, fora do slot) garante um aviso por dia
 *   mesmo com reload.
 */
export function useMahoragaEvent(notify = false) {
  const [lastFoughtDay, setLastFoughtDay] = useState<string | null>(
    readLastFoughtDay,
  );
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), MAHORAGA_EVENT_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const state: MahoragaEventState = getMahoragaEventState(now, lastFoughtDay);

  useEffect(() => {
    if (!notify || state.status !== "active") return;
    const today = toDayKey(now);
    if (localStorage.getItem(MAHORAGA_NOTIFIED_KEY) === today) return;
    localStorage.setItem(MAHORAGA_NOTIFIED_KEY, today);
    void showLocalNotification(
      "O Mahoraga apareceu!",
      "O General Divino está à solta por 10 minutos. Vá enfrentá-lo antes que ele desapareça.",
    );
  }, [notify, state.status, now]);

  const markFought = useCallback(() => {
    const today = toDayKey(new Date());
    localStorage.setItem(slotKey(MAHORAGA_EVENT_KEY), today);
    setLastFoughtDay(today);
  }, []);

  return { ...state, markFought };
}
