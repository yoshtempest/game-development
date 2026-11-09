import { useCallback, useState } from "react";
import type { CharacterId } from "@/data/characters/list";
import {
  DEFAULT_DRIKA_ARM,
  type DrikaArm,
  isDrikaArm,
} from "@/data/characters/drika/drikaArms";

type Props = {
  character: CharacterId;
  playerHP: number;
  setPlayerHP: (hp: number) => void;
};

/**
 * Mecânica da Drika (Sigilo): troca o braço/arm em uso, pagando 5% da vida
 * atual. A seleção é feita pelo jogador entre os 4 braços disponíveis.
 */
export function useSigilo({ character, playerHP, setPlayerHP }: Props) {
  const [arm, setArm] = useState<DrikaArm>(DEFAULT_DRIKA_ARM);
  const [sigiloOpen, setSigiloOpen] = useState(false);

  const available = character === "drika";

  const openSigilo = useCallback(() => {
    if (!available) return;
    setSigiloOpen(true);
  }, [available]);

  const closeSigilo = useCallback(() => {
    setSigiloOpen(false);
  }, []);

  const selectArm = useCallback(
    (next: string): boolean => {
      if (!available) return false;
      if (!isDrikaArm(next)) return false;
      if (next === arm) {
        setSigiloOpen(false);
        return false;
      }
      const cost = Math.max(1, Math.floor(playerHP * 0.05));
      if (playerHP <= cost) return false;
      setPlayerHP(playerHP - cost);
      setArm(next);
      setSigiloOpen(false);
      return true;
    },
    [available, arm, playerHP, setPlayerHP],
  );

  return {
    arm: available ? arm : undefined,
    sigiloOpen: available ? sigiloOpen : false,
    openSigilo,
    closeSigilo,
    selectArm,
  };
}

