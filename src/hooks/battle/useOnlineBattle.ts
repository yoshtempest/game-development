import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useOnline } from "@/contexts/OnlineContext";
import { useBattleSocket } from "@/hooks/useBattleSocket";
import { useBattleSnapshot } from "@/hooks/battle/useBattleSnapshot";
import { useInterpolatedSnapshot } from "@/hooks/battle/useInterpolatedSnapshot";
import { useBattleInputRelay } from "@/hooks/battle/useBattleInputRelay";
import { useBattleLifecycle } from "@/hooks/battle/useBattleLifecycle";
import type { useNpcAI } from "@/hooks/battle/npc/ai/useAi";
import type { useBattleSystem } from "@/hooks/battle/main/battleSystem/useSystem";

type Props = {
  player: Player;
  npc: ReturnType<typeof useNpcAI>;
  battle: ReturnType<typeof useBattleSystem>;
  handleRetry: () => void;
  handleContinue: () => void;
  showVictoryBase: boolean;
  showDefeatBase: boolean;
  xpReward: number;
  lastRewards: unknown;
};

export function useOnlineBattle({
  player,
  npc,
  battle,
  handleRetry,
  handleContinue,
  showVictoryBase,
  showDefeatBase,
  xpReward,
  lastRewards,
}: Props) {
  const navigate = useNavigate();
  const online = useOnline();
  const {
    connected: battleSocketConnected,
    reconnecting: battleSocketReconnecting,
    send: battleSocketSend,
    lastMessage: battleSocketLast,
  } = useBattleSocket(online.roomId, online.playerId);
  const isBattleHost = online.room?.hostId === online.playerId;
  const isBattleGuest = !isBattleHost && online.connected;

  const [remotePlayerState, setRemotePlayerState] = useState<{
    x: number;
    y: number;
    hp: number;
    state?: string;
    character?: string;
  } | null>(null);

  const [interpRemotePlayer, setInterpRemotePlayer] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [guestHasSnapshot, setGuestHasSnapshot] = useState(false);

  const { snapshot: remoteBattleSnapshot } = useBattleSnapshot({
    isHost: isBattleHost,
    send: battleSocketSend,
    lastMessage: battleSocketLast,
    getState: () => ({
      t: Date.now(),
      player: { x: player.x, y: player.y, hp: battle.playerHP },
      npc: { x: npc.x, y: npc.y, hp: battle.npcHP, phase: battle.npcPhase ?? 1 },
    }),
  });
  const interpolatedRemoteSnapshot = useInterpolatedSnapshot(
    isBattleHost ? null : remoteBattleSnapshot,
  );

  if (isBattleGuest) {
    if (remoteBattleSnapshot) {
      setGuestHasSnapshot(true);
    }
    if (interpolatedRemoteSnapshot?.player) {
      player.x = interpolatedRemoteSnapshot.player.x;
      player.y = interpolatedRemoteSnapshot.player.y;
    }
    if (interpolatedRemoteSnapshot?.npc) {
      npc.x = interpolatedRemoteSnapshot.npc.x;
      npc.y = interpolatedRemoteSnapshot.npc.y;
    }
    if (remoteBattleSnapshot?.player) {
      battle.playerHP = remoteBattleSnapshot.player.hp;
    }
    if (remoteBattleSnapshot?.npc) {
      battle.npcHP = remoteBattleSnapshot.npc.hp;
      if (remoteBattleSnapshot.npc.phase != null) {
        battle.npcPhase = remoteBattleSnapshot.npc.phase;
      }
    }
  }

  void interpolatedRemoteSnapshot;

  const [opponentHP, setOpponentHP] = useState(1000);
  const [opponentMaxHP, setOpponentMaxHP] = useState(1000);
  const lastAttackProcessedRef = useRef<string | null>(null);

  // Guest envia seu estado de batalha
  useEffect(() => {
    if (isBattleHost || !online.connected) return;
    const id = setInterval(() => {
      battleSocketSend({
        type: "playerState",
        x: player.x,
        y: player.y,
        hp: battle.playerHP,
        state: player.state,
        character: player.character,
      });
    }, 100);
    return () => clearInterval(id);
  }, [isBattleHost, online.connected, battleSocketSend, player.x, player.y, player.state, battle.playerHP, player.character]);

  // Host recebe estado do guest
  useEffect(() => {
    if (!isBattleHost) return;
    if (battleSocketLast?.type !== "playerState") return;
    setRemotePlayerState({
      x: Number(battleSocketLast.x ?? 0),
      y: Number(battleSocketLast.y ?? 0),
      hp: Number(battleSocketLast.hp ?? 0),
      state: battleSocketLast.state as string | undefined,
      character: battleSocketLast.character as string | undefined,
    });
  }, [isBattleHost, battleSocketLast]);

  // Host: interpola posição do segundo jogador
  useEffect(() => {
    if (!isBattleHost) return;
    if (!remotePlayerState) return;
    setInterpRemotePlayer((prev) => {
      if (!prev) return { x: remotePlayerState.x, y: remotePlayerState.y };
      return {
        x: prev.x + (remotePlayerState.x - prev.x) * 0.3,
        y: prev.y + (remotePlayerState.y - prev.y) * 0.3,
      };
    });
  }, [isBattleHost, remotePlayerState]);

  // Host: interpola posição do segundo jogador (duplicado no original)
  useEffect(() => {
    if (!isBattleHost) return;
    if (!remotePlayerState) return;
    setInterpRemotePlayer((prev) => {
      if (!prev) return { x: remotePlayerState.x, y: remotePlayerState.y };
      return {
        x: prev.x + (remotePlayerState.x - prev.x) * 0.3,
        y: prev.y + (remotePlayerState.y - prev.y) * 0.3,
      };
    });
  }, [isBattleHost, remotePlayerState]);

  // Host: sincroniza HP do oponente a partir do guest
  useEffect(() => {
    if (!isBattleHost) return;
    if (!remotePlayerState) return;
    setOpponentMaxHP((prev) => (prev === 1000 ? remotePlayerState.hp || 1000 : prev));
    setOpponentHP((prev) => (remotePlayerState.hp ? remotePlayerState.hp : prev));
  }, [isBattleHost, remotePlayerState]);

  // Guest: oponente é o host (HP via snapshot)
  useEffect(() => {
    if (isBattleHost) return;
    if (!remoteBattleSnapshot?.player) return;
    const hp = remoteBattleSnapshot.player.hp;
    setOpponentMaxHP((prev) => (prev === 1000 ? hp || 1000 : prev));
    setOpponentHP((prev) => (hp ? hp : prev));
  }, [isBattleHost, remoteBattleSnapshot]);

  // Host: aplica dano ao oponente quando ataca em alcance (básico)
  useEffect(() => {
    if (!isBattleHost || !online.connected) return;
    if (!remotePlayerState) return;
    const state = player.state;
    if (state !== "attack" && state !== "preAttack") return;
    const key = `${state}-${player.x}-${player.y}`;
    if (lastAttackProcessedRef.current === key) return;
    const dist = Math.hypot(player.x - remotePlayerState.x, player.y - remotePlayerState.y);
    if (dist > 180) return;
    lastAttackProcessedRef.current = key;
    const amount = 15;
    setOpponentHP((hp) => Math.max(0, hp - amount));
    battleSocketSend({ type: "opponentDamage", amount });
  }, [isBattleHost, online.connected, player.state, player.x, player.y, remotePlayerState, battleSocketSend]);

  // Teste de dano: host pressiona 'P' para causar dano no oponente
  useEffect(() => {
    if (!isBattleHost || !online.connected) return;
    const handler = (e: KeyboardEvent) => {
      if (e.code !== "KeyP") return;
      const amount = 10;
      setOpponentHP((hp) => Math.max(0, hp - amount));
      battleSocketSend({ type: "opponentDamage", amount });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isBattleHost, online.connected, battleSocketSend]);

  // Guest: recebe dano do host
  useEffect(() => {
    if (isBattleHost) return;
    if (battleSocketLast?.type !== "opponentDamage") return;
    const amount = Number(battleSocketLast.amount ?? 0);
    setOpponentHP((hp) => Math.max(0, hp - amount));
  }, [isBattleHost, battleSocketLast]);

  // Guest: acompanha retry/leave do host
  useEffect(() => {
    if (isBattleHost) return;
    if (battleSocketLast?.type === "battleRetry") {
      window.location.reload();
    }
    if (battleSocketLast?.type === "battleLeave") {
      void navigate(-1);
    }
  }, [isBattleHost, battleSocketLast, navigate]);

  // Guest: solicita re-sync ao conectar
  useEffect(() => {
    if (isBattleHost) return;
    if (!battleSocketConnected) return;
    battleSocketSend({ type: "requestSync" });
  }, [isBattleHost, battleSocketConnected, battleSocketSend]);

  // Host: responde a requestSync com snapshot completo
  useEffect(() => {
    if (!isBattleHost) return;
    if (battleSocketLast?.type !== "requestSync") return;
    battleSocketSend({
      type: "battleSnapshot",
      t: Date.now(),
      player: { x: player.x, y: player.y, hp: battle.playerHP },
      npc: { x: npc.x, y: npc.y, hp: battle.npcHP, phase: battle.npcPhase ?? 1 },
    });
  }, [isBattleHost, battleSocketLast, battleSocketSend, player.x, player.y, battle.playerHP, npc.x, npc.y, battle.npcHP, battle.npcPhase]);

  useEffect(() => {
    if (isBattleHost) return;
    if (battleSocketConnected) return;
    const t = setTimeout(() => {
      void navigate(-1);
    }, 15000);
    return () => clearTimeout(t);
  }, [isBattleHost, battleSocketConnected, navigate]);

  useBattleInputRelay({
    isHost: isBattleHost,
    send: battleSocketSend,
    lastMessage: battleSocketLast,
  });

  const { remoteResult, remoteRewards, notifyResult } = useBattleLifecycle({
    isHost: isBattleHost,
    send: battleSocketSend,
    lastMessage: battleSocketLast,
  });

  const handleRetrySync = () => {
    handleRetry();
    if (isBattleHost && online.connected) {
      battleSocketSend({ type: "battleRetry" });
    }
  };

  const handleContinueSync = () => {
    handleContinue();
    if (isBattleHost && online.connected) {
      battleSocketSend({ type: "battleLeave" });
    }
  };

  const showVictory = isBattleGuest
    ? remoteResult === "victory"
    : showVictoryBase;
  const showDefeat = isBattleGuest
    ? remoteResult === "defeat"
    : showDefeatBase;

  useEffect(() => {
    if (!isBattleHost) return;
    if (showVictory) notifyResult("victory", { xpReward, lastRewards });
    else if (showDefeat) notifyResult("defeat", { xpReward, lastRewards });
  }, [isBattleHost, showVictory, showDefeat, notifyResult, xpReward, lastRewards]);

  // PvP: vitória quando o oponente é derrotado
  useEffect(() => {
    if (!isBattleHost || !online.connected) return;
    if (opponentHP <= 0) {
      notifyResult("victory", { xpReward, lastRewards });
    }
  }, [isBattleHost, online.connected, opponentHP, notifyResult, xpReward, lastRewards]);

  void remoteResult;

  return {
    onlineConnected: online.connected,
    isBattleHost,
    isBattleGuest,
    battleSocketConnected,
    battleSocketReconnecting,
    battleSocketSend,
    battleSocketLast,
    remotePlayerState,
    interpRemotePlayer,
    guestHasSnapshot,
    opponentHP,
    opponentMaxHP,
    remoteResult,
    remoteRewards,
    notifyResult,
    handleRetrySync,
    handleContinueSync,
    showVictory,
    showDefeat,
    remoteBattleSnapshot,
    interpolatedRemoteSnapshot,
  };
}
