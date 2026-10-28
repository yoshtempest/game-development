import { useState, useCallback } from "react";

type Piercing = {
  id: number;
  x: number;
  y: number;
};

type Props = {
  character: string;
};

export function useBattleEffects({ character }: Props) {
  const [piercings, setPiercings] = useState<Piercing[]>([]);
  const [isExploding, setIsExploding] = useState(false);

  const createRandomOffset = useCallback(() => {
    const radius = 20;
    const angle = Math.random() * Math.PI * 2;

    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  }, []);

  const spawnPiercing = useCallback(() => {
    if (character !== "laricell") return;

    const offset = createRandomOffset();

    setPiercings((prev) => [
      ...prev,
      {
        id: Date.now(),
        x: offset.x,
        y: offset.y,
      },
    ]);
  }, [character, createRandomOffset]);

  const triggerExplosion = useCallback(() => {
    if (character !== "laricell") return;

    setIsExploding(true);
    setPiercings([]);

    setTimeout(() => {
      setIsExploding(false);
    }, 300);
  }, [character]);

  const resetEffects = useCallback(() => {
    setPiercings([]);
    setIsExploding(false);
  }, []);

  return {
    piercings,
    isExploding,
    spawnPiercing,
    triggerExplosion,
    resetEffects,
  };
}
