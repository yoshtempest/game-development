import type { DamageNumber } from "./types";
import { useState, useCallback, useRef, useEffect } from "react";



export function useDamageNumbers() {
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const spawnDamageNumber = useCallback(
    (value: number, x: number, y: number, type: DamageType) => {
      const id = idRef.current++;
      const entry: DamageNumber = { id, value, x, y, type };
      setDamageNumbers((prev) => [...prev, entry]);

      const timer = setTimeout(() => {
        timersRef.current.delete(id);
        setDamageNumbers((prev) => prev.filter((n) => n.id !== id));
      }, 1000);

      timersRef.current.set(id, timer);
    },
    [],
  );

  const clearDamageNumbers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current.clear();
    setDamageNumbers([]);
  }, []);

  return { damageNumbers, spawnDamageNumber, clearDamageNumbers };
}
