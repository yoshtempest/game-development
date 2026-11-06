import { useCallback, useEffect, useRef, useState } from "react";

import { useLatestRef } from "@/hooks/useLatestRef";
import { BabidiDomainConstants } from "@/data/characters/babidi";
import { useSkillGuard } from "@/hooks/battle/player/characters/skillGuard/useSkillGuard";

export type MachineGamaState = {
  x: number;
  y: number;
  state:
    "walk" | "entering" | "idle" | "attack" | "run" | "falling" | "exploding";
} | null;

export type BabidiDomainExpansionApi = {
  domainExpansionActive: boolean;
  domainExpansionShattering: boolean;
  press: () => void;
  usable: boolean;
  machineGama: MachineGamaState;
  machineGamaShield: number;
  machineGamaShieldRef: React.RefObject<number>;
  breakMachineGama: () => void;
  machineGamaControl: boolean;
};

export type BabidiDomainExpansionProps = {
  player: Player;
  setPlayer: (fn: (p: Player) => Player) => void;
  playerMaxHp: number;
  shieldRef: React.RefObject<number>;
  npc: { x: number; y: number };
  freezeActionsUntilRef: React.RefObject<number>;
  disabledRef: React.RefObject<boolean>;
  isPausedRef: React.RefObject<boolean>;
  battleEndedRef: React.RefObject<boolean>;
  startSpecialIntro: (char: string, cb: () => void, ability: string) => void;
  setDelicia: (fn: (d: number) => number) => void;
  charges: number;
  chargesMax: number;
};

export function useBabidiDomainExpansion({
  player,
  setPlayer,
  playerMaxHp,
  shieldRef,
  freezeActionsUntilRef,
  disabledRef,
  isPausedRef,
  battleEndedRef,
  startSpecialIntro,
  setDelicia,
  charges,
  chargesMax,
}: BabidiDomainExpansionProps): BabidiDomainExpansionApi {
  const [active, setActive] = useState(false);
  const [shattering, setShattering] = useState(false);
  const [machineGama, setMachineGama] = useState<MachineGamaState>(null);
  const [machineGamaShield, setMachineGamaShield] = useState(0);
  const [machineGamaControl, setMachineGamaControl] = useState(false);
  const activeRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const chargesRef = useLatestRef(charges);
  const chargesMaxRef = useLatestRef(chargesMax);
  const setDeliciaRef = useLatestRef(setDelicia);

  const { usableRef } = useSkillGuard({
    player,
    character: "babidi",
    freezeActionsUntilRef,
    disabledRef,
    isPausedRef,
    battleEndedRef,
    extraCanUse: () =>
      chargesRef.current >= chargesMaxRef.current && !activeRef.current,
    extraCancel: () => !activeRef.current,
  });

  const breakMachineGama = useCallback(() => {
    if (animRef.current) {
      clearInterval(animRef.current);
      animRef.current = null;
    }
    setMachineGama((prev) => (prev ? { ...prev, state: "exploding" } : prev));
    shieldRef.current = 0;
    setMachineGamaShield(0);
    // Jogador pula saindo de cima do Machine Gama.
    setPlayer((p) => ({ ...p, state: "jump" }));
    // Após a explosão, fade-out e remoção.
    setTimeout(() => {
      setMachineGama(null);
    }, 1200);
  }, [setPlayer, shieldRef]);

  const press = useCallback(() => {
    if (activeRef.current) return;
    if (!usableRef.current) return;
    if (chargesRef.current < chargesMaxRef.current) return;

    setDeliciaRef.current(() => 0);
    activeRef.current = true;
    setActive(true);
    setShattering(false);
    const machineGamaHp = playerMaxHp * BabidiDomainConstants.MACHINE_GAMA_HP_MULTIPLIER;
    setMachineGamaShield(machineGamaHp);
    shieldRef.current = machineGamaHp;

    // Bloqueia controles durante a animação de entrada.
    freezeActionsUntilRef.current = Date.now() + 4000;

    startSpecialIntro(
      "babidi",
      () => {
        // playSound("domainExpansion");
      },
      "domainExpansion",
    );

    // Machine Gama surge da esquerda em walk e se aproxima do jogador.
    const groundY = player.groundY;
    const targetX = player.x;
    setMachineGama({ x: -120, y: groundY, state: "walk" });

    if (animRef.current) clearInterval(animRef.current);
    animRef.current = setInterval(() => {
      setMachineGama((prev) => {
        if (!prev) return prev;
        if (prev.state === "walk") {
          const nextX = prev.x + 6;
          if (nextX >= targetX - 60) {
            // Ao chegar perto, troca para entering e faz o jogador pular.
            setPlayer((p) => ({ ...p, state: "jump" }));
            return { ...prev, x: targetX - 60, state: "entering" };
          }
          return { ...prev, x: nextX };
        }
        if (prev.state === "entering") {
          // Após a animação de entrada, fica idle.
          setTimeout(() => {
            setMachineGama((p) => (p ? { ...p, state: "idle" } : p));
          }, 800);
          return prev;
        }
        return prev;
      });
    }, 50);

    // Duração do domínio: 8s. Ao fim, o domínio se desfaz (shattering), mas o
    // Machine Gama permanece em batalha em vez de desaparecer.
    timerRef.current = setTimeout(() => {
      setShattering(true);
      setTimeout(() => {
        activeRef.current = false;
        setActive(false);
        setShattering(false);
        // Babidi desaparece e o jogador passa a controlar o Machine Gama.
        setMachineGama(null);
        setMachineGamaControl(true);
        setPlayer((p) => ({ ...p, machineGamaControl: true, state: "jump" }));
      }, 1500);
    }, 8000);
  }, [
    usableRef,
    chargesRef,
    chargesMaxRef,
    setDeliciaRef,
    startSpecialIntro,
    freezeActionsUntilRef,
    player,
    setPlayer,
    playerMaxHp,
    shieldRef,
  ]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    domainExpansionActive: active,
    domainExpansionShattering: shattering,
    press,
    usable: usableRef.current,
    machineGama,
    machineGamaShield,
    machineGamaShieldRef: shieldRef,
    breakMachineGama,
    machineGamaControl,
  };
}
