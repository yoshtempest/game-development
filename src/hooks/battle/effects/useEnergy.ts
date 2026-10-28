import { useCallback, useEffect, useRef, useState } from "react";
import { useLatestRef } from "@/hooks/useLatestRef";

/**
 * Personagens com barra de energia (fluxo).
 * Atualmente apenas o Marshadow (id "marshadow") possui.
 */
const ENERGY_CHARACTERS = new Set<CharacterId>(["marshadow"]);

const ENERGY_MAX = 100;

/**
 * Distância (em px de movimento no mapa da batalha) necessária para 1% de energia.
 * Calibrado para ~1000px → 10% da barra (~3s de movimento contínuo).
 * 100% = ~10000px (~30s de movimento contínuo).
 */
const ENERGY_PX_PER_PERCENT = 30;

/** Escudo concedido ao receber dano em % da vida máxima quando a barra está cheia. */
const ENERGY_SHIELD_PERCENT = 5;

export type EnergyState = {
  /** Caracteres sem barra de energia não usam o sistema. */
  enabled: boolean;
  /** 0..100. Sempre 100 para personagens sem energia. */
  energy: number;
  /** Reseta a barra (uso no reset da batalha). */
  resetEnergy: () => void;
  /** Zera a barra e concede escudo caso esteja cheia (ao receber dano). */
  consumeOnDamage: () => void;
};

export function useEnergy(
  player: Player,
  playerMaxHp: number,
  setPlayerShield: React.Dispatch<React.SetStateAction<number>>,
): EnergyState {
  const isMarshadow = ENERGY_CHARACTERS.has(player.character);
  const [energy, setEnergy] = useState(ENERGY_MAX);
  const energyRef = useLatestRef(energy);
  const lastXRef = useRef(player.x);
  const playerXRef = useLatestRef(player.x);
  const maxHpRef = useLatestRef(playerMaxHp);
  const setPlayerShieldRef = useLatestRef(setPlayerShield);

  useEffect(() => {
    if (!isMarshadow) return;

    lastXRef.current = playerXRef.current;
    const id = setInterval(() => {
      const current = playerXRef.current;
      const distance = Math.abs(current - lastXRef.current);
      if (distance > 0) {
        setEnergy((e) =>
          Math.min(ENERGY_MAX, e + distance / ENERGY_PX_PER_PERCENT),
        );
      }
      lastXRef.current = current;
    }, 16);

    return () => clearInterval(id);
  }, [isMarshadow, playerXRef]);

  const resetEnergy = useCallback(() => {
    setEnergy(ENERGY_MAX);
  }, []);

  const consumeOnDamage = useCallback(() => {
    if (!isMarshadow) return;
    if (energyRef.current >= ENERGY_MAX) {
      const shield = Math.round(
        (maxHpRef.current * ENERGY_SHIELD_PERCENT) / 100,
      );
      setPlayerShieldRef.current((s) => s + shield);
      setEnergy(0);
    }
  }, [isMarshadow, energyRef, maxHpRef, setPlayerShieldRef]);

  return { enabled: isMarshadow, energy, resetEnergy, consumeOnDamage };
}
