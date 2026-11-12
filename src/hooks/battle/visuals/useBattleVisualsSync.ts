import { useEffect, useRef, useState } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { rebaseEpochTimes } from "@/utils/rebaseEpochTimes";
import type { BattleSocketMessage } from "@/hooks/useBattleSocket";

type Subscribe = (
  type: string,
  listener: (msg: BattleSocketMessage) => void,
) => () => void;

/** Efeito em curso anda a 20 Hz, igual ao snapshot do NPC no co-op. */
const SEND_INTERVAL_MS = 50;

/** Reenvio sem mudança: o outro lado descobre que o estado continua valendo. */
const HEARTBEAT_MS = 1000;

/** Sem pacote há mais que isto, a camada remota some (jogador saiu/caiu). */
const STALE_MS = 3000;

/** Amostras para estimar o offset de relógio (o menor é o de menor latência). */
const CLOCK_SAMPLES = 20;

type Props<T> = {
  enabled: boolean;
  /** Jogador cujos visuais este cliente desenha (filtra o `from`). */
  remoteId: string | null;
  send: (msg: BattleSocketMessage) => void;
  subscribe: Subscribe;
  /** Estado visual local, serializável em JSON (sem funções). */
  build: () => T;
};

/**
 * Espelha entre os dois clientes o que as habilidades de cada jogador geram
 * na tela (entidades, feixes, intros, domínio…).
 *
 * A simulação continua local: cada cliente só *desenha* o que o outro gerou.
 * Por isso o payload é o mesmo estado que já alimenta `BattleEntities` e os
 * overlays — habilidade nova aparece no outro lado sem código de rede próprio.
 *
 * - Envio: o payload é serializado a cada 50 ms e só sai quando muda (mais
 *   um heartbeat por segundo), então parado o canal fica quase mudo.
 * - Recepção: instantes `Date.now()` do outro aparelho são trazidos para o
 *   relógio local pelo menor `agora - sentAt` recente.
 *
 * @returns Último estado visual do outro jogador, ou `null` se não houver.
 */
export function useBattleVisualsSync<T>({
  enabled,
  remoteId,
  send,
  subscribe,
  build,
}: Props<T>): T | null {
  const buildRef = useLatestRef(build);

  useEffect(() => {
    if (!enabled) return;
    let last = "";
    let lastSentAt = 0;
    const id = setInterval(() => {
      let payload: string;
      try {
        payload = JSON.stringify(buildRef.current());
      } catch {
        return;
      }
      const now = Date.now();
      if (payload === last && now - lastSentAt < HEARTBEAT_MS) return;
      last = payload;
      lastSentAt = now;
      send({ type: "battleVisuals", sentAt: now, payload });
    }, SEND_INTERVAL_MS);
    return () => clearInterval(id);
  }, [enabled, send, buildRef]);

  const [remote, setRemote] = useState<{ value: T; at: number } | null>(null);
  const offsetsRef = useRef<number[]>([]);

  useEffect(() => {
    if (!enabled) return;
    return subscribe("battleVisuals", (msg) => {
      if (remoteId && msg.from !== remoteId) return;
      if (typeof msg.payload !== "string") return;
      let parsed: unknown;
      try {
        parsed = JSON.parse(msg.payload);
      } catch {
        return;
      }
      if (!parsed || typeof parsed !== "object") return;
      const now = Date.now();
      const sentAt = Number(msg.sentAt);
      const samples = offsetsRef.current;
      if (Number.isFinite(sentAt)) {
        samples.push(now - sentAt);
        if (samples.length > CLOCK_SAMPLES) samples.shift();
      }
      const offset = samples.length > 0 ? Math.min(...samples) : 0;
      setRemote({ value: rebaseEpochTimes(parsed as T, offset), at: now });
    });
  }, [enabled, remoteId, subscribe]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [enabled]);

  if (!enabled || !remote || now - remote.at > STALE_MS) return null;
  return remote.value;
}
