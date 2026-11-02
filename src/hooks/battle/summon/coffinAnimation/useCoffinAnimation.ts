import type { CoffinState } from "./types";
import { useCallback, useEffect, useRef, useState } from "react";

export function useCoffinAnimation() {
  const [coffins, setCoffins] = useState<CoffinState[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const beginSequence = useCallback(
    (
      spawnPositions: number[],
      groundY: number,
      npcType: string,
      onSpawn: (npcType: string, x: number) => void,
    ) => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];

      setCoffins(
        spawnPositions.map((x, i) => ({
          id: `coffin_${i}`,
          x,
          y: groundY,
          npcType,
          phase: "closed" as const,
        })),
      );

      const t1 = setTimeout(() => {
        setCoffins((prev) =>
          prev.map((c) => ({ ...c, phase: "open" as const })),
        );
        spawnPositions.forEach((x) => {
          onSpawn(npcType, x - 50);
        });
      }, 500);
      timersRef.current.push(t1);

      const t2 = setTimeout(() => {
        setCoffins((prev) =>
          prev.map((c) => ({ ...c, phase: "fading" as const })),
        );
      }, 1000);
      timersRef.current.push(t2);

      const t3 = setTimeout(() => {
        setCoffins([]);
      }, 1500);
      timersRef.current.push(t3);
    },
    [],
  );

  const clearCoffins = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setCoffins([]);
  }, []);

  return { coffins, beginSequence, clearCoffins };
}
