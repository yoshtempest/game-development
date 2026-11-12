import { useEffect, useRef, useState } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useNavigate } from "react-router";
import { useOnline } from "@/contexts/OnlineContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useBattleSnapshot } from "@/hooks/battle/useBattleSnapshot";
import { useInterpolatedSnapshot } from "@/hooks/battle/useInterpolatedSnapshot";
import { useBattleLifecycle } from "@/hooks/battle/useBattleLifecycle";
import { applyPlayerStatus } from "@/gameRules/battle/status/statusEffects";
import { clampX } from "@/gameRules/movement/clampX";
import type { BattleNet } from "@/hooks/battle/useBattleNet";
import type { NpcHitIntent } from "@/hooks/battle/coop/types";
import type { useNpcAI } from "@/hooks/battle/npc/ai/useAi";
import type { useBattleSystem } from "@/hooks/battle/main/battleSystem/useSystem";
import type { BattleSnapshot } from "@/hooks/battle/useBattleSnapshot";

type Props = {
  player: Player;
  npc: ReturnType<typeof useNpcAI>;
  battle: ReturnType<typeof useBattleSystem>;
  net: BattleNet;
  handleRetry: () => void;
  handleContinue: () => void;
  showVictoryBase: boolean;
  showDefeatBase: boolean;
  xpReward: number;
  lastRewards: unknown;
  battleLeaderId?: string;
  isPvp?: boolean;
  /** Batalha 2v1 (ver `BattleCoop.active`). */
  coopActive?: boolean;
  /** Derrota local do guest quando o líder anuncia a derrota da dupla. */
  runCoopDefeat?: () => void;
  /**
   * Sequência do O Abençoado em curso no jogador local: golpes do líder que
   * deslocam o player (empurrão, puxão, investida, arremesso, arrasto,
   * agarrão) são ignorados para não cancelar a coreografia.
   */
  honoredSequence?: boolean;
};

export function useOnlineBattle({
  player,
  npc,
  battle,
  net,
  handleRetry,
  handleContinue,
  showVictoryBase,
  showDefeatBase,
  xpReward,
  lastRewards,
  coopActive = false,
  runCoopDefeat,
  honoredSequence = false,
}: Props) {
  const navigate = useNavigate();
  const online = useOnline();
  const { setPlayer } = usePlayer();
  const {
    connected: battleSocketConnected,
    reconnecting: battleSocketReconnecting,
    send: battleSocketSend,
    subscribe: battleSocketSubscribe,
    isHost: isBattleHost,
    isGuest: isBattleGuest,
    isPvp,
    remotePlayer: remotePlayerState,
    interpRemotePlayer,
    remoteSnapshot: remoteBattleSnapshot,
  } = net;

  const [guestHasSnapshot, setGuestHasSnapshot] = useState(false);
  const playerId = online.playerId;

  // ── Snapshot do líder ────────────────────────────────────────────────────
  // O envio vive aqui porque o estado autoritativo (player/NPC/HPs) só existe
  // depois da cena; a recepção fica no `useBattleNet` (montado antes dela).
  const buildSnapshot = (): BattleSnapshot => ({
    t: Date.now(),
    player: {
      x: player.x,
      y: player.y,
      hp: battle.playerHP,
      state: player.state,
      direction: player.battleDirection,
      character: player.character,
    },
    npc: {
      x: npc.x,
      y: npc.y,
      hp: battle.npcHP,
      state: npc.state,
      direction: npc.direction,
      hidden: npc.hidden,
      phase: battle.npcPhase ?? 1,
      projectiles: npc.projectiles,
    },
  });
  const buildSnapshotRef = useLatestRef(buildSnapshot);

  useBattleSnapshot({
    isHost: isBattleHost,
    send: battleSocketSend,
    getState: buildSnapshot,
  });

  const interpolatedRemoteSnapshot = useInterpolatedSnapshot(
    isBattleHost ? null : remoteBattleSnapshot,
  );

  useEffect(() => {
    if (!isBattleGuest || !remoteBattleSnapshot) return;
    setGuestHasSnapshot(true);
  }, [isBattleGuest, remoteBattleSnapshot]);

  // ── Guest: espelha o NPC autoritativo do líder ───────────────────────────
  // O guest não roda IA (`npcAuthority: false`); posição/estado/direção vêm do
  // snapshot. A posição usa o snapshot interpolado por RAF para o NPC não
  // andar em degraus de 100 ms.
  const setNpc = npc.setNpc;
  const setNpcProjectiles = npc.setProjectiles;
  const interpolatedNpc = interpolatedRemoteSnapshot?.npc;

  useEffect(() => {
    if (!isBattleGuest || isPvp || !interpolatedNpc) return;
    setNpc((previous) => {
      const x = clampX(interpolatedNpc.x);
      const y = interpolatedNpc.y;
      const state = interpolatedNpc.state ?? previous.state;
      const direction = interpolatedNpc.direction ?? previous.direction;
      const hidden = interpolatedNpc.hidden ?? previous.hidden;
      if (
        previous.x === x &&
        previous.y === y &&
        previous.state === state &&
        previous.direction === direction &&
        previous.hidden === hidden
      ) {
        return previous;
      }
      return { ...previous, x, y, state, direction, hidden };
    });
  }, [isBattleGuest, isPvp, interpolatedNpc, setNpc]);

  useEffect(() => {
    if (!isBattleGuest || isPvp) return;
    setNpcProjectiles(remoteBattleSnapshot?.npc?.projectiles ?? []);
  }, [
    isBattleGuest,
    isPvp,
    remoteBattleSnapshot?.npc?.projectiles,
    setNpcProjectiles,
  ]);

  // ── Co-op: autoridade compartilhada ──────────────────────────────────────
  // O líder manda no NPC; o guest manda no próprio HP/posição. O guest adota o
  // NPC do líder (HP/fase) e devolve o dano que causou, senão o dano dele
  // sumiria a cada snapshot.
  // HP que o líder mandou por último. Serve para distinguir uma queda causada
  // pelo guest (que precisa ser relatada) de uma queda vinda do snapshot.
  const lastAppliedHostHpRef = useRef<number | null>(null);
  const prevLocalHpRef = useRef<number | null>(null);
  // Setters estáveis: `battle` é recriado a cada render e não serve de dep.
  const setNpcHP = battle.setNpcHP;
  const setNpcPhase = battle.setNpcPhase;
  const npcHP = battle.npcHP;

  useEffect(() => {
    if (!isBattleGuest || isPvp) return;
    const snap = remoteBattleSnapshot?.npc;
    if (!snap) return;
    lastAppliedHostHpRef.current = snap.hp;
    setNpcHP(snap.hp);
    if (snap.phase != null) setNpcPhase(snap.phase);
  }, [isBattleGuest, isPvp, remoteBattleSnapshot, setNpcHP, setNpcPhase]);

  useEffect(() => {
    if (!isBattleGuest || isPvp) return;
    const prev = prevLocalHpRef.current;
    prevLocalHpRef.current = npcHP;
    if (prev == null || npcHP >= prev) return;
    // Queda que chegou pelo snapshot do líder não é dano do guest.
    if (lastAppliedHostHpRef.current === npcHP) return;
    battleSocketSend({ type: "battleNpcDamage", amount: prev - npcHP });
  }, [isBattleGuest, isPvp, npcHP, battleSocketSend]);

  // Líder aplica o dano relatado pelo guest no NPC autoritativo. Por assinatura
  // (e não `lastMessage`): um `battlePlayerState` logo depois engoliria o dano.
  useEffect(() => {
    if (!isBattleHost || isPvp) return;
    return battleSocketSubscribe("battleNpcDamage", (message) => {
      const amount = Number(message.amount ?? 0);
      if (!Number.isFinite(amount) || amount <= 0) return;
      setNpcHP((hp) => Math.max(0, hp - amount));
    });
  }, [isBattleHost, isPvp, battleSocketSubscribe, setNpcHP]);

  // ── Guest: resolve um golpe decidido pelo líder ──────────────────────────
  // O líder manda a *intenção* (natureza/multiplicador); o cliente dono do
  // alvo resolve armadura, esquiva, bloqueio e status com os próprios dados.
  const battleRef = useLatestRef(battle);
  const setPlayerRef = useLatestRef(setPlayer);
  const honoredSequenceRef = useLatestRef(honoredSequence);

  useEffect(() => {
    if (!isBattleGuest || isPvp || !playerId) return;
    return battleSocketSubscribe("battleNpcHit", (message) => {
      const hit = message as unknown as NpcHitIntent;
      if (hit.to !== playerId) return;
      const currentBattle = battleRef.current;
      const displacementLocked = honoredSequenceRef.current;

      const pushAway = (
        npcX: number | undefined,
        distance: number,
        ms: number,
      ) => {
        if (npcX == null || displacementLocked) return;
        setPlayerRef.current((p) => {
          const direction = npcX > p.x ? -1 : 1;
          return {
            ...p,
            pullFromX: p.x,
            pullToX: clampX(p.x + direction * distance),
            pullStartTime: Date.now(),
            pullDuration: ms,
          };
        });
      };

      switch (hit.source) {
        case "melee":
          currentBattle.npcMeleeHit(hit.multiplier, hit.damageKind, true);
          break;
        case "ranged":
          currentBattle.npcRangedHit(hit.damageKind, true);
          break;
        case "burst":
          currentBattle.npcBurstHit(hit.pushDir ?? 1);
          break;
        case "fixed":
          currentBattle.npcFixedHit(hit.amount ?? 1);
          break;
        case "laser":
          currentBattle.npcFixedHit(hit.amount ?? 1);
          pushAway(hit.npcX, 5, 0);
          break;
        case "throw":
          currentBattle.npcThrowHit(hit.multiplier ?? 1);
          break;
        case "unblockable":
          currentBattle.npcUnblockableHit(hit.amount ?? 1);
          break;
        case "execute":
          currentBattle.damagePlayerHp(currentBattle.playerMaxHp);
          break;
        case "status":
          if (hit.status) {
            setPlayerRef.current((p) => applyPlayerStatus(p, hit.status!));
          }
          break;
        case "push":
          pushAway(hit.npcX, 200, 300);
          break;
        case "pull":
          if (hit.npcX != null && !displacementLocked) {
            setPlayerRef.current((p) => {
              const direction = hit.npcX! > p.x ? 1 : -1;
              return {
                ...p,
                pullFromX: p.x,
                pullToX: clampX(p.x + direction * 200),
                pullStartTime: Date.now(),
              };
            });
          }
          break;
        case "ram":
          if (hit.toX != null && !displacementLocked) {
            setPlayerRef.current((p) => ({
              ...p,
              x: clampX(hit.toX!),
              battleDirection: hit.direction ?? p.battleDirection,
            }));
          }
          break;
        case "throwStart":
          if (hit.npcX != null && !displacementLocked) {
            setPlayerRef.current((p) => {
              const direction = hit.npcX! > p.x ? -1 : 1;
              return {
                ...p,
                throwStartTime: Date.now(),
                throwFromX: p.x,
                throwToX: clampX(p.x + direction * 300),
                battleDirection: hit.direction ?? p.battleDirection,
                state: "fallen",
              };
            });
          }
          break;
        case "drag":
          if (hit.npcX != null && hit.npcY != null && !displacementLocked) {
            setPlayerRef.current((p) => ({
              ...p,
              x: clampX(hit.npcX! - 8),
              y: hit.npcY! + 4,
              state: "fallen",
              battleDirection: hit.npcX! >= p.x ? "right" : "left",
            }));
            // O arrasto do alfa aplica 1 hit fixo no início, como no dono.
            currentBattle.npcFixedHit(hit.amount ?? 1);
          }
          break;
        case "grab":
          if (hit.flipped != null && !displacementLocked) {
            setPlayerRef.current((p) => ({
              ...p,
              grabbedUntil: Date.now() + 4000,
            }));
          }
          break;
        default:
          break;
      }
    });
  }, [
    isBattleGuest,
    isPvp,
    playerId,
    battleSocketSubscribe,
    battleRef,
    setPlayerRef,
    honoredSequenceRef,
  ]);

  // Guest envia seu estado de batalha. `battlePlayerState` é distinto de
  // `playerState` (estado de exploração/sala) para o servidor não confundir os
  // dois canais. O payload vai num ref para o intervalo não ser recriado a
  // cada frame (o que o impedia de disparar).
  // `maxHp`/`armor`/`level`/`name` alimentam o PvP: o oponente usa a armadura
  // e o HP máximo deste jogador no próprio funil de dano e no HUD.
  const battlePlayerStateRef = useLatestRef({
    x: player.x,
    y: player.y,
    hp: battle.playerHP,
    maxHp: battle.playerMaxHp,
    armor: battle.totalArmor,
    level: battle.char.level,
    name: online.playerName,
    state: player.state,
    direction: player.battleDirection,
    character: player.character,
  });

  useEffect(() => {
    if (isBattleHost || !online.connected) return;
    const id = setInterval(() => {
      battleSocketSend({
        type: "battlePlayerState",
        ...battlePlayerStateRef.current,
      });
    }, 100);
    return () => clearInterval(id);
  }, [isBattleHost, online.connected, battleSocketSend, battlePlayerStateRef]);

  // Mudança de estado (ataque, pulo, direção) não pode esperar o próximo tick de
  // 100 ms: sem isso a animação remota chega atrasada e "trava" no meio do golpe.
  const lastSentStateRef = useRef<string | null>(null);
  useEffect(() => {
    if (isBattleHost || !online.connected) return;
    const key = `${player.state}|${player.battleDirection}`;
    if (lastSentStateRef.current === key) return;
    lastSentStateRef.current = key;
    battleSocketSend({
      type: "battlePlayerState",
      ...battlePlayerStateRef.current,
    });
  }, [
    isBattleHost,
    online.connected,
    player.state,
    player.battleDirection,
    battleSocketSend,
    battlePlayerStateRef,
  ]);

  // Guest: solicita re-sync ao conectar (no duelo não há líder para responder)
  useEffect(() => {
    if (isBattleHost || isPvp) return;
    if (!battleSocketConnected) return;
    battleSocketSend({ type: "requestSync" });
  }, [isBattleHost, isPvp, battleSocketConnected, battleSocketSend]);

  // Host: responde a requestSync com snapshot completo. Antes o effect
  // dependia de `lastMessage` + todo o estado da cena e reenviava o snapshot a
  // cada frame enquanto `requestSync` fosse a última mensagem.
  useEffect(() => {
    if (!isBattleHost) return;
    return battleSocketSubscribe("requestSync", () => {
      battleSocketSend({
        type: "battleSnapshot",
        ...buildSnapshotRef.current(),
      });
    });
  }, [isBattleHost, battleSocketSubscribe, battleSocketSend, buildSnapshotRef]);

  // Socket da batalha caído por 15 s tira o jogador da luta. Só vale online:
  // fora de sala não existe socket, e "sem conexão" ali é o estado normal —
  // sem o guard toda batalha solo era abandonada sozinha depois de 15 s.
  useEffect(() => {
    if (isBattleHost || !online.connected) return;
    if (battleSocketConnected) return;
    const t = setTimeout(() => {
      void navigate(-1);
    }, 15000);
    return () => clearTimeout(t);
  }, [isBattleHost, online.connected, battleSocketConnected, navigate]);

  const { remoteResult, remoteRewards, notifyResult, clearRemoteResult } =
    useBattleLifecycle({
      isHost: isBattleHost,
      send: battleSocketSend,
      subscribe: battleSocketSubscribe,
    });

  // Guest: acompanha retry/leave do host. O retry reinicia a luta local em vez
  // de `location.reload()` — o reload apagava sala e guilda da memória e o
  // guest caía da partida online.
  const handleRetryRef = useLatestRef(handleRetry);
  const coopDefeatRanRef = useRef(false);
  useEffect(() => {
    if (isBattleHost || isPvp) return;
    const offRetry = battleSocketSubscribe("battleRetry", () => {
      coopDefeatRanRef.current = false;
      clearRemoteResult();
      handleRetryRef.current();
    });
    const offLeave = battleSocketSubscribe("battleLeave", () => {
      void navigate(-1);
    });
    return () => {
      offRetry();
      offLeave();
    };
  }, [
    isBattleHost,
    isPvp,
    battleSocketSubscribe,
    clearRemoteResult,
    handleRetryRef,
    navigate,
  ]);

  // Guest no co-op: a derrota da dupla chega pelo líder. O guest roda a própria
  // derrota uma vez (morte/tempo do personagem dele), já que ao cair só virou
  // espectador.
  useEffect(() => {
    if (!isBattleGuest || !coopActive || remoteResult !== "defeat") return;
    if (coopDefeatRanRef.current) return;
    coopDefeatRanRef.current = true;
    runCoopDefeat?.();
  }, [isBattleGuest, coopActive, remoteResult, runCoopDefeat]);

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
  const showDefeat = isBattleGuest ? remoteResult === "defeat" : showDefeatBase;

  useEffect(() => {
    if (!isBattleHost) return;
    if (showVictory) notifyResult("victory", { xpReward, lastRewards });
    else if (showDefeat) notifyResult("defeat", { xpReward, lastRewards });
  }, [
    isBattleHost,
    showVictory,
    showDefeat,
    notifyResult,
    xpReward,
    lastRewards,
  ]);

  return {
    onlineConnected: online.connected,
    isBattleHost,
    isBattleGuest,
    battleSocketConnected,
    battleSocketReconnecting,
    battleSocketSend,
    remotePlayerState,
    interpRemotePlayer,
    guestHasSnapshot,
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
