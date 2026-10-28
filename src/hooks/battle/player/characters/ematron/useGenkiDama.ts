import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useLatestRef } from "@/hooks/useLatestRef";
import {
  GENKI_DAMA_BASE_RADIUS,
  GENKI_DAMA_DRAIN_END_INTERVAL_MS,
  GENKI_DAMA_DRAIN_RAMP_MS,
  GENKI_DAMA_DRAIN_START_INTERVAL_MS,
  GENKI_DAMA_GROW_INTERVAL_MS,
  GENKI_DAMA_GROW_MULTIPLIER,
  GENKI_DAMA_HOVER_OFFSET,
  GENKI_DAMA_INITIAL_COST,
  GENKI_DAMA_LAND_CROUCH_MS,
  GENKI_DAMA_MAX_DAMAGE_MULTIPLIER,
  GENKI_DAMA_RISE_MS,
  GENKI_DAMA_THROW_MS,
} from "@/data/characters/ematron";
import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { SoundId } from "@/utils/audio/soundId";
import type { GenkiDamaVisual } from "@/utils/types/character/ematron";
import { useSkillGuard } from "@/hooks/battle/player/characters/useSkillGuard";

type Props = {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  battleManaRef: RefObject<BattleManaApi | null>;
  freezeActionsUntilRef: RefObject<number>;
  /** Usado para o pouso pós-habilidade virar `idleCrounched` (mesmo ref do honored-one). */
  honoredFallRef: RefObject<boolean>;
  /** Instante de início da subida (gravidade usa para subir 300px em 2.5s). */
  genkiDamaRiseStartRef: RefObject<number>;
  /** y do jogador no instante em que a subida disparou. */
  genkiDamaRiseStartYRef: RefObject<number>;
  /** NPC principal (x/y lidos via latestRef para o voo da Genki Dama). */
  npc: { x: number; y: number };
  /** Dispara o dano em área na explosão. */
  onExplode: (x: number, y: number, radius: number, multiplier: number) => void;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  /** Chamado quando o press realmente inicia a Genki Dama (carga da Expansão de Domínio). */
  onUsed?: () => void;
  isPausedRef: RefObject<boolean>;
  /** true quando os controles gerais de batalha estão desabilitados (pause, transição de fase, throw). */
  disabledRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
};

/**
 * Genki Dama do Ematron: segurar o botão faz o personagem flutuar 300px em y
 * (sprite falling.svg) em 2.5s. Ao chegar no topo troca para
 * `preparingGenkiDama.svg` e surge a instância `genkiDama.svg` pairando acima
 * dele, que cresce 1.2x por segundo enquanto o Ki é drenado (1 Ki a cada 200ms,
 * rampeando até 1 Ki a cada 40ms em 5s). Soltar durante a subida derruba o
 * jogador (falling → idleCrounched → idle). Soltar no preparing troca para
 * `throwGenkiDama.svg`, arremessa a Genki Dama ao inimigo principal e aplica
 * dano em área proporcional ao tamanho (máx 7x o dano do ataque básico).
 */
export function useEmatronGenkiDama({
  player,
  setPlayer,
  battleManaRef,
  freezeActionsUntilRef,
  honoredFallRef,
  genkiDamaRiseStartRef,
  genkiDamaRiseStartYRef,
  npc,
  onExplode,
  playSound,
  onUsed,
  isPausedRef,
  disabledRef,
  battleEndedRef,
}: Props) {
  const [genkiDamaVisual, setGenkiDamaVisual] =
    useState<GenkiDamaVisual | null>(null);

  const activeRef = useRef(false);
  const phaseRef = useRef<"rising" | "preparing" | "throwing">("rising");
  const scaleRef = useRef(1);
  const nextDrainAtRef = useRef(0);
  /** true enquanto o jogador ainda não pousou depois do release/cancel. */
  const landPendingRef = useRef(false);

  const holdTickerRef = useRef<NodeJS.Timeout | null>(null);
  const drainIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const growTimerRef = useRef<NodeJS.Timeout | null>(null);
  const throwIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const setPlayerRef = useLatestRef(setPlayer);
  const playerRef = useLatestRef(player);
  const npcRef = useLatestRef(npc);
  const onExplodeRef = useLatestRef(onExplode);
  const onUsedRef = useLatestRef(onUsed);
  const playSoundRef = useLatestRef(playSound);

  const { usableRef: canUseRef, shouldCancelRef } = useSkillGuard({
    player,
    character: "ematron",
    freezeActionsUntilRef,
    disabledRef,
    isPausedRef,
    battleEndedRef,
    extraUsable: () =>
      (battleManaRef.current?.playerMana ?? 0) >= GENKI_DAMA_INITIAL_COST,
  });

  const clearTimers = useCallback(() => {
    if (holdTickerRef.current) {
      clearInterval(holdTickerRef.current);
      holdTickerRef.current = null;
    }
    if (drainIntervalRef.current) {
      clearInterval(drainIntervalRef.current);
      drainIntervalRef.current = null;
    }
    if (growTimerRef.current) {
      clearInterval(growTimerRef.current);
      growTimerRef.current = null;
    }
    if (throwIntervalRef.current) {
      clearInterval(throwIntervalRef.current);
      throwIntervalRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    phaseRef.current = "throwing";
    clearTimers();
    genkiDamaRiseStartRef.current = 0;
    freezeActionsUntilRef.current = Date.now();
    honoredFallRef.current = true;
    landPendingRef.current = true;
    setGenkiDamaVisual(null);
    setPlayerRef.current((p) =>
      p.mode !== "battle" ? p : { ...p, state: "falling" },
    );
  }, [
    clearTimers,
    freezeActionsUntilRef,
    genkiDamaRiseStartRef,
    honoredFallRef,
    setPlayerRef,
  ]);

  const cancelRef = useLatestRef(cancel);

  const startThrow = useCallback(
    (startX: number, startY: number) => {
      const fromX = startX;
      const fromY = startY;
      const targetX = npcRef.current.x;
      const targetY = npcRef.current.y;
      const start = Date.now();

      throwIntervalRef.current = setInterval(() => {
        const t = Math.min(1, (Date.now() - start) / GENKI_DAMA_THROW_MS);
        const x = fromX + (targetX - fromX) * t;
        const y = fromY + (targetY - fromY) * t;
        setGenkiDamaVisual((v) => (v ? { ...v, phase: "flying", x, y } : v));

        if (t < 1) return;

        const interval = throwIntervalRef.current;
        throwIntervalRef.current = null;
        if (interval) clearInterval(interval);

        const scale = scaleRef.current;
        onExplodeRef.current(
          x,
          y,
          GENKI_DAMA_BASE_RADIUS * scale,
          Math.min(GENKI_DAMA_MAX_DAMAGE_MULTIPLIER, scale),
        );
        playSoundRef.current("explosion");
        setGenkiDamaVisual(null);
        activeRef.current = false;
        setPlayerRef.current((p) =>
          p.mode !== "battle" || p.state !== "throwGenkiDama"
            ? p
            : { ...p, state: "falling" },
        );
      }, 16);
    },
    [npcRef, onExplodeRef, playSoundRef, setPlayerRef],
  );

  const release = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    clearTimers();
    genkiDamaRiseStartRef.current = 0;
    freezeActionsUntilRef.current = Date.now();

    if (phaseRef.current === "rising") {
      honoredFallRef.current = true;
      landPendingRef.current = true;
      setGenkiDamaVisual(null);
      setPlayerRef.current((p) =>
        p.mode !== "battle" ? p : { ...p, state: "falling" },
      );
      return;
    }
    if (phaseRef.current === "preparing") {
      phaseRef.current = "throwing";
      honoredFallRef.current = true;
      landPendingRef.current = true;
      setPlayerRef.current((p) =>
        p.mode !== "battle" ? p : { ...p, state: "throwGenkiDama" },
      );
      const startVisual =
        genkiDamaVisual ??
        (() => {
          const p = playerRef.current;
          return {
            scale: scaleRef.current,
            phase: "preparing" as const,
            x: p.x,
            y: p.y - GENKI_DAMA_HOVER_OFFSET,
          };
        })();
      startThrow(startVisual.x, startVisual.y);
    }
  }, [
    clearTimers,
    freezeActionsUntilRef,
    genkiDamaRiseStartRef,
    genkiDamaVisual,
    honoredFallRef,
    playerRef,
    setPlayerRef,
    startThrow,
  ]);

  const releaseRef = useLatestRef(release);

  const enterPreparing = useCallback(() => {
    if (phaseRef.current !== "rising") return;
    phaseRef.current = "preparing";
    scaleRef.current = 1;
    const p = playerRef.current;

    setPlayerRef.current((pp) =>
      pp.mode !== "battle" ? pp : { ...pp, state: "preparingGenkiDama" },
    );
    setGenkiDamaVisual({
      scale: 1,
      phase: "preparing",
      x: p.x,
      y: p.y - GENKI_DAMA_HOVER_OFFSET,
    });

    const now = Date.now();
    nextDrainAtRef.current = now + GENKI_DAMA_DRAIN_START_INTERVAL_MS;
    if (drainIntervalRef.current) clearInterval(drainIntervalRef.current);
    drainIntervalRef.current = setInterval(() => {
      if (shouldCancelRef.current()) {
        cancelRef.current();
        return;
      }
      if (phaseRef.current !== "preparing") return;

      const at = Date.now();
      if (at < nextDrainAtRef.current) return;

      battleManaRef.current?.consumeMana(1);
      if ((battleManaRef.current?.playerMana ?? 0) <= 0) {
        releaseRef.current();
        return;
      }
      const elapsed = at - genkiDamaRiseStartRef.current;
      const ramp = Math.min(1, elapsed / GENKI_DAMA_DRAIN_RAMP_MS);
      const interval =
        GENKI_DAMA_DRAIN_START_INTERVAL_MS +
        (GENKI_DAMA_DRAIN_END_INTERVAL_MS -
          GENKI_DAMA_DRAIN_START_INTERVAL_MS) *
          ramp;
      nextDrainAtRef.current = at + interval;
    }, 20);

    if (growTimerRef.current) clearInterval(growTimerRef.current);
    growTimerRef.current = setInterval(() => {
      if (phaseRef.current !== "preparing") return;
      scaleRef.current *= GENKI_DAMA_GROW_MULTIPLIER;
      setGenkiDamaVisual((v) =>
        v && v.phase === "preparing" ? { ...v, scale: scaleRef.current } : v,
      );
    }, GENKI_DAMA_GROW_INTERVAL_MS);
  }, [
    battleManaRef,
    cancelRef,
    genkiDamaRiseStartRef,
    playerRef,
    releaseRef,
    setPlayerRef,
    shouldCancelRef,
  ]);

  const enterPreparingRef = useLatestRef(enterPreparing);

  const press = useCallback(() => {
    if (activeRef.current) return;
    if (!canUseRef.current) return;

    const mana = battleManaRef.current;
    if (!mana || !mana.consumeMana(GENKI_DAMA_INITIAL_COST)) return;

    onUsedRef.current?.();
    activeRef.current = true;
    phaseRef.current = "rising";
    landPendingRef.current = false;
    const current = playerRef.current;
    genkiDamaRiseStartRef.current = Date.now();
    genkiDamaRiseStartYRef.current = current.y;
    freezeActionsUntilRef.current = Infinity;

    setPlayerRef.current((p) =>
      p.mode !== "battle" ? p : { ...p, state: "genkiDamaRising" },
    );

    if (holdTickerRef.current) clearInterval(holdTickerRef.current);
    holdTickerRef.current = setInterval(() => {
      if (shouldCancelRef.current()) {
        cancelRef.current();
        return;
      }
      const phase = phaseRef.current;
      if (phase === "rising") {
        if (Date.now() - genkiDamaRiseStartRef.current >= GENKI_DAMA_RISE_MS) {
          enterPreparingRef.current();
        }
        return;
      }
      if (phase === "preparing") {
        const p = playerRef.current;
        setGenkiDamaVisual((v) =>
          v && v.phase === "preparing"
            ? { ...v, x: p.x, y: p.y - GENKI_DAMA_HOVER_OFFSET }
            : v,
        );
      }
    }, 16);
  }, [
    battleManaRef,
    canUseRef,
    cancelRef,
    enterPreparingRef,
    freezeActionsUntilRef,
    genkiDamaRiseStartRef,
    genkiDamaRiseStartYRef,
    onUsedRef,
    playerRef,
    setPlayerRef,
    shouldCancelRef,
  ]);

  // Pouso controlado: quando o release/cancel marcou a queda, o pouso vira
  // idleCrounched (via honoredFallRef na gravidade) e depois de um instante
  // volta para idle e o ref é limpo.
  useEffect(() => {
    if (!landPendingRef.current) return;
    if (
      player.state === "idleCrounched" &&
      Math.abs(player.y - player.groundY) < 1
    ) {
      landPendingRef.current = false;
      honoredFallRef.current = false;
      const timer = setTimeout(() => {
        setPlayerRef.current((p) =>
          p.state === "idleCrounched" ? { ...p, state: "idle" } : p,
        );
      }, GENKI_DAMA_LAND_CROUCH_MS);
      return () => clearTimeout(timer);
    }
    return;
  }, [player.state, player.y, player.groundY, honoredFallRef, setPlayerRef]);

  useEffect(() => {
    const cancel = cancelRef.current;
    return () => {
      if (activeRef.current) cancel();
      clearTimers();
    };
  }, [cancelRef, clearTimers]);

  return {
    genkiDamaVisual,
    press,
    release,
    canUse: canUseRef.current,
  };
}
