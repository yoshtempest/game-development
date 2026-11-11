import { useEffect, useMemo, useState } from "react";
import { useOnline } from "@/contexts/OnlineContext";
import { useBattleSocket } from "@/hooks/useBattleSocket";
import { useInterpolatedRemotePlayer } from "@/hooks/battle/useInterpolatedRemotePlayer";
import type { BattleSnapshot } from "@/hooks/battle/useBattleSnapshot";
import type { NpcTarget } from "@/gameRules/battle/npc/targeting";

export type BattleRemotePlayer = {
  id: string;
  x: number;
  y: number;
  hp: number;
  state?: string;
  direction?: Direction;
  character?: string;
};

/**
 * Camada de rede da batalha, montada **antes** de `useBattleScene`.
 *
 * A IA do NPC precisa enxergar a posição do jogador remoto, mas ela vive dentro
 * de `useBattleScene`; por isso o socket e os papéis líder/guest não podem ficar
 * no `useOnlineBattle` (que só roda depois da cena). Este hook é o único dono do
 * `useBattleSocket`; o `useOnlineBattle` consome a mesma instância para
 * snapshots, dano no NPC e ciclo de vida.
 */
export function useBattleNet({
  battleLeaderId,
  isPvp,
}: {
  battleLeaderId?: string;
  isPvp: boolean;
}) {
  const online = useOnline();
  const { connected, reconnecting, send, subscribe, lastMessage } =
    useBattleSocket(online.roomId, online.playerId);

  // PvP usa o host da sala; co-op usa quem iniciou a batalha.
  const isHost = isPvp
    ? online.room?.hostId === online.playerId
    : online.connected &&
      (battleLeaderId ?? online.playerId) === online.playerId;
  const isGuest = online.connected && !isHost;

  // Quem manda `battlePlayerState` para este cliente.
  const remoteId = isPvp
    ? isHost
      ? online.room?.players.find((p) => p.id !== online.playerId)?.id
      : online.room?.hostId
    : isHost
      ? online.guildId
      : battleLeaderId;

  const [remotePlayer, setRemotePlayer] = useState<BattleRemotePlayer | null>(
    null,
  );
  const interpRemotePlayer = useInterpolatedRemotePlayer(remotePlayer);

  // Snapshot do líder (só o guest recebe). Fica aqui porque a cena precisa do
  // HP remoto para decidir se a luta continua (espectador) antes de montar o
  // `useOnlineBattle`.
  const [remoteSnapshot, setRemoteSnapshot] = useState<BattleSnapshot | null>(
    null,
  );

  useEffect(() => {
    if (!isHost) return;
    return subscribe("battlePlayerState", (msg) => {
      const from = msg.from as string | undefined;
      if (remoteId && from && from !== remoteId) return;
      setRemotePlayer({
        id: from ?? remoteId ?? "",
        x: Number(msg.x ?? 0),
        y: Number(msg.y ?? 0),
        hp: Number(msg.hp ?? 0),
        state: msg.state as string | undefined,
        direction: msg.direction as Direction | undefined,
        character: msg.character as string | undefined,
      });
    });
  }, [isHost, remoteId, subscribe]);

  useEffect(() => {
    if (!isGuest) return;
    return subscribe("battleSnapshot", (msg) => {
      setRemoteSnapshot(msg as unknown as BattleSnapshot);
    });
  }, [isGuest, subscribe]);

  const remoteTarget = useMemo<NpcTarget | null>(() => {
    if (!isHost || isPvp || !remoteId || !remotePlayer) return null;
    return {
      id: remoteId,
      x: remotePlayer.x,
      y: remotePlayer.y,
      state: (remotePlayer.state as PlayerState) ?? "idle",
      direction: remotePlayer.direction ?? "down",
      character: remotePlayer.character ?? "drika",
      isLocal: false,
      alive: remotePlayer.hp > 0,
    };
  }, [isHost, isPvp, remoteId, remotePlayer]);

  // Sem dado do parceiro ainda, assume vivo: um falso "morto" faria o jogador
  // virar espectador (ou perder) antes do primeiro pacote chegar.
  const remoteAlive = remoteTarget
    ? remoteTarget.alive
    : remoteSnapshot?.player
      ? remoteSnapshot.player.hp > 0
      : true;

  return {
    connected: online.connected,
    socketConnected: connected,
    reconnecting,
    playerId: online.playerId,
    isPvp,
    isHost,
    isGuest,
    remoteId: remoteId ?? null,
    send,
    subscribe,
    lastMessage,
    remotePlayer,
    interpRemotePlayer,
    remoteSnapshot,
    remoteTarget,
    remoteAlive,
  };
}

export type BattleNet = ReturnType<typeof useBattleNet>;
