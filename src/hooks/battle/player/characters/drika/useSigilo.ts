import { useCallback, useEffect, useRef, useState } from "react";
import type { CharacterId } from "@/data/characters/list";
import {
  DEFAULT_DRIKA_ARM,
  type DrikaArm,
  isDrikaArm,
  DRIKA_ARM_ICONS,
} from "@/data/characters/drika/drikaArms";

export type SigiloPhase = "idle" | "biting" | "risking" | "getting";

const BITING_MS = 600;
const GETTING_MS = 600;

type Props = {
  character: CharacterId;
  playerHP: number;
  setPlayerHP: (hp: number) => void;
};

export function useSigilo({ character, playerHP, setPlayerHP }: Props) {
  const [arm, setArm] = useState<DrikaArm>(DEFAULT_DRIKA_ARM);
  const [phase, setPhase] = useState<SigiloPhase>("idle");
  const [sigiloOpen, setSigiloOpen] = useState(false);
  const [selectedArmIcon, setSelectedArmIcon] = useState<string | null>(null);
  const [pentagramVisible, setPentagramVisible] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const available = character === "drika";

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const openSigilo = useCallback(() => {
    if (!available) return;
    if (phase !== "idle") return;
    setPhase("biting");
    setSigiloOpen(false);
    setPentagramVisible(false);
    setSelectedArmIcon(null);
    clearTimer();
    timerRef.current = setTimeout(() => {
      setPhase("risking");
      setPentagramVisible(true);
      setSigiloOpen(true);
    }, BITING_MS);
  }, [available, phase, clearTimer]);

  const closeSigilo = useCallback(() => {
    if (phase === "getting") return;
    clearTimer();
    setPhase("idle");
    setSigiloOpen(false);
    setPentagramVisible(false);
    setSelectedArmIcon(null);
  }, [phase, clearTimer]);

  const selectArm = useCallback(
    (next: string): boolean => {
      if (!available) return false;
      if (!isDrikaArm(next)) return false;
      if (phase !== "risking") return false;
      if (next === arm) {
        // mesma arma: apenas fecha
        clearTimer();
        setPhase("idle");
        setSigiloOpen(false);
        setPentagramVisible(false);
        setSelectedArmIcon(null);
        return false;
      }
      const cost = Math.max(1, Math.floor(playerHP * 0.05));
      if (playerHP <= cost) return false;
      setSelectedArmIcon(DRIKA_ARM_ICONS[next]);
      setPhase("getting");
      setSigiloOpen(false);
      clearTimer();
      timerRef.current = setTimeout(() => {
        setPlayerHP(playerHP - cost);
        setArm(next);
        setPhase("idle");
        setPentagramVisible(false);
        setSelectedArmIcon(null);
      }, GETTING_MS);
      return true;
    },
    [available, phase, arm, playerHP, setPlayerHP, clearTimer],
  );

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    arm: available ? arm : undefined,
    sigiloPhase: available ? phase : "idle",
    sigiloOpen: available ? sigiloOpen : false,
    pentagramVisible: available ? pentagramVisible : false,
    selectedArmIcon: available ? selectedArmIcon : null,
    openSigilo,
    closeSigilo,
    selectArm,
  };
}