import { useCallback, useEffect, useRef, useState } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import type { BattleSocketMessage } from "@/hooks/useBattleSocket";

type Subscribe = (
  type: string,
  listener: (msg: BattleSocketMessage) => void,
) => () => void;

export type PvpBestOf = 1 | 3 | 5;

export const PVP_BEST_OF_OPTIONS: readonly PvpBestOf[] = [1, 3, 5];

export type PvpPhase = "waiting" | "fighting" | "roundEnd" | "matchEnd";

export type PvpRoundResult = "win" | "loss" | "draw";

/**
 * Espera depois do primeiro `pvpDown` de um round antes de decidir. Os dois
 * podem cair no mesmo golpe trocado; sem a janela o round viraria vitória de
 * quem recebeu a mensagem por último.
 */
const ROUND_RESOLVE_MS = 700;

/** Pausa entre rounds com o placar na tela. */
const ROUND_PAUSE_MS = 2500;

/**
 * Normaliza o "melhor de N" vindo do convite ou da rota.
 *
 * Args:
 *     value (unknown): Valor bruto (state da rota, mensagem do socket).
 *
 * Returns:
 *     PvpBestOf: 1, 3 ou 5 — qualquer outra coisa vira 1.
 */
export function parsePvpBestOf(value: unknown): PvpBestOf {
  const n = Number(value);
  return n === 3 || n === 5 ? n : 1;
}

/**
 * Rounds necessários para levar a série.
 *
 * Args:
 *     bestOf (PvpBestOf): Tamanho da série.
 *
 * Returns:
 *     number: Maioria simples (1, 2 ou 3).
 */
export function pvpWinsNeeded(bestOf: PvpBestOf): number {
  return Math.floor(bestOf / 2) + 1;
}

/**
 * Resultado do round a partir de quem caiu.
 *
 * Args:
 *     meDown (boolean): O jogador local caiu.
 *     opponentDown (boolean): O oponente caiu.
 *
 * Returns:
 *     PvpRoundResult: Empate quando os dois caíram.
 */
export function resolvePvpRound(
  meDown: boolean,
  opponentDown: boolean,
): PvpRoundResult {
  if (meDown && opponentDown) return "draw";
  return meDown ? "loss" : "win";
}

type Props = {
  enabled: boolean;
  bestOf: PvpBestOf;
  playerId: string;
  opponentId: string | null;
  /** Já chegou pelo menos um pacote do oponente na arena. */
  opponentSeen: boolean;
  /** Pacote do oponente é recente (queda de rede encerra a série por W.O.). */
  opponentFresh: boolean;
  /** Reinicia a luta local (HP, NPC proxy, posição) para o próximo round. */
  resetRound: () => void;
  onLeave: () => void;
  send: (msg: BattleSocketMessage) => void;
  subscribe: Subscribe;
};

/**
 * Controle da série do duelo (#257: melhor de 1, 3 ou 5).
 *
 * Não existe árbitro: cada cliente só sabe do próprio HP. Quem cai manda
 * `pvpDown` com o número do round, e os dois lados contam a partir dos mesmos
 * eventos — por isso o placar fica igual nas duas telas sem um host. Revanche
 * exige os dois pedidos; sair, ou ficar sem pacote, dá W.O. ao outro.
 */
export function usePvpMatch({
  enabled,
  bestOf,
  playerId,
  opponentId,
  opponentSeen,
  opponentFresh,
  resetRound,
  onLeave,
  send,
  subscribe,
}: Props) {
  const [phase, setPhase] = useState<PvpPhase>("waiting");
  const [round, setRound] = useState(1);
  const [wins, setWins] = useState({ me: 0, opponent: 0 });
  const [lastResult, setLastResult] = useState<PvpRoundResult | null>(null);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [walkover, setWalkover] = useState(false);
  const [rematchRequested, setRematchRequested] = useState(false);
  const [opponentRematch, setOpponentRematch] = useState(false);

  const phaseRef = useLatestRef(phase);
  const roundRef = useLatestRef(round);
  const winsRef = useLatestRef(wins);
  const resetRoundRef = useLatestRef(resetRound);
  const downsRef = useRef({ me: false, opponent: false });
  const resolveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextRoundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (resolveTimerRef.current) clearTimeout(resolveTimerRef.current);
    if (nextRoundTimerRef.current) clearTimeout(nextRoundTimerRef.current);
    resolveTimerRef.current = null;
    nextRoundTimerRef.current = null;
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    if (!enabled || phase !== "waiting" || !opponentSeen) return;
    setPhase("fighting");
  }, [enabled, phase, opponentSeen]);

  const startRound = useCallback(
    (nextRound: number) => {
      downsRef.current = { me: false, opponent: false };
      setRound(nextRound);
      setLastResult(null);
      setPhase("fighting");
      resetRoundRef.current();
    },
    [resetRoundRef],
  );

  const resolveRound = useCallback(() => {
    resolveTimerRef.current = null;
    if (phaseRef.current !== "fighting") return;
    const { me, opponent } = downsRef.current;
    const result = resolvePvpRound(me, opponent);
    const current = winsRef.current;
    const next = {
      me: current.me + (result === "win" ? 1 : 0),
      opponent: current.opponent + (result === "loss" ? 1 : 0),
    };
    setWins(next);
    setLastResult(result);
    const needed = pvpWinsNeeded(bestOf);
    if (next.me >= needed || next.opponent >= needed) {
      setPhase("matchEnd");
      return;
    }
    setPhase("roundEnd");
    const nextRound = roundRef.current + 1;
    nextRoundTimerRef.current = setTimeout(() => {
      nextRoundTimerRef.current = null;
      startRound(nextRound);
    }, ROUND_PAUSE_MS);
  }, [bestOf, phaseRef, roundRef, winsRef, startRound]);

  const registerDown = useCallback(
    (who: "me" | "opponent", downRound: number) => {
      if (phaseRef.current !== "fighting") return;
      if (downRound !== roundRef.current) return;
      downsRef.current = { ...downsRef.current, [who]: true };
      if (resolveTimerRef.current) return;
      resolveTimerRef.current = setTimeout(resolveRound, ROUND_RESOLVE_MS);
    },
    [phaseRef, roundRef, resolveRound],
  );

  const reportLocalDown = useCallback(() => {
    if (!enabled || !opponentId) return;
    send({ type: "pvpDown", to: opponentId, round: roundRef.current });
    registerDown("me", roundRef.current);
  }, [enabled, opponentId, send, roundRef, registerDown]);

  /**
   * Oponente saiu ou sumiu. Com a série em aberto é W.O.; com ela já decidida
   * só desliga a revanche — sair depois de perder não vira vitória dele nem
   * derrota minha.
   */
  const forfeit = useCallback(() => {
    clearTimers();
    setOpponentLeft(true);
    if (phaseRef.current !== "matchEnd") setWalkover(true);
    setPhase("matchEnd");
  }, [clearTimers, phaseRef]);

  useEffect(() => {
    if (!enabled || !opponentId) return;
    const fromOpponent = (msg: BattleSocketMessage) =>
      msg.from === opponentId && msg.to === playerId;
    const offDown = subscribe("pvpDown", (msg) => {
      if (!fromOpponent(msg)) return;
      registerDown("opponent", Number(msg.round));
    });
    const offRematch = subscribe("pvpRematch", (msg) => {
      if (!fromOpponent(msg)) return;
      setOpponentRematch(true);
    });
    const offLeave = subscribe("pvpLeave", (msg) => {
      if (!fromOpponent(msg)) return;
      forfeit();
    });
    return () => {
      offDown();
      offRematch();
      offLeave();
    };
  }, [enabled, opponentId, playerId, subscribe, registerDown, forfeit]);

  useEffect(() => {
    if (!enabled || !opponentSeen || opponentFresh) return;
    if (phase !== "fighting" && phase !== "roundEnd") return;
    forfeit();
  }, [enabled, opponentSeen, opponentFresh, phase, forfeit]);

  useEffect(() => {
    if (phase !== "matchEnd" || opponentLeft) return;
    if (!rematchRequested || !opponentRematch) return;
    setRematchRequested(false);
    setOpponentRematch(false);
    setWins({ me: 0, opponent: 0 });
    startRound(1);
  }, [phase, opponentLeft, rematchRequested, opponentRematch, startRound]);

  const requestRematch = useCallback(() => {
    if (!opponentId || opponentLeft) return;
    setRematchRequested(true);
    send({ type: "pvpRematch", to: opponentId });
  }, [opponentId, opponentLeft, send]);

  const leave = useCallback(() => {
    clearTimers();
    if (opponentId) send({ type: "pvpLeave", to: opponentId });
    onLeave();
  }, [clearTimers, opponentId, send, onLeave]);

  const needed = pvpWinsNeeded(bestOf);
  const matchResult: "win" | "loss" | null =
    phase !== "matchEnd"
      ? null
      : walkover || wins.me >= needed
        ? "win"
        : "loss";

  return {
    phase,
    round,
    bestOf,
    wins,
    lastResult,
    matchResult,
    walkover,
    opponentLeft,
    rematchRequested,
    opponentRematch,
    reportLocalDown,
    requestRematch,
    leave,
  };
}

export type PvpMatch = ReturnType<typeof usePvpMatch>;
