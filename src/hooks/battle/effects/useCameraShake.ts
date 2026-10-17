import { useCallback, useEffect, useRef, useState } from "react";
import type { DamageNumber } from "@/hooks/battle/damage/useNumbers";

const MAX_INTENSITY = 50;
const MAX_DAMAGE_FOR_INTENSITY = 200;
const INTENSITY_PER_DAMAGE = 0.25;
const SHAKE_DECAY = 0.88;
const MIN_INTENSITY = 0.1;
/** Intensidade do tremor enquanto um projétil terrestre detona atravessa a arena. */
const EXTERNAL_SHAKE_INTENSITY = 1;
/** Tremor leve e contínuo enquanto o Vastolord grita na transformação. */
const SCREAM_SHAKE_INTENSITY = 4;

export function useCameraShake(
  damageNumbers: DamageNumber[],
  externalShake = false,
  burstActive = false,
  screamShake = false,
) {
  const intensityRef = useRef(0);
  const runningRef = useRef(false);
  const rafRef = useRef(0);
  const seenIdsRef = useRef<Set<number>>(new Set());
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const externalShakeRef = useRef(externalShake);
  externalShakeRef.current = externalShake;
  const screamShakeRef = useRef(screamShake);
  screamShakeRef.current = screamShake;

  const startLoop = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;

    const step = () => {
      // Fontes "vivas": seguram a intensidade fixa enquanto estão ativas. O
      // grito do Vastolord entra na mesma mecânica, com intensidade menor.
      const liveExternal = externalShakeRef.current;
      const liveScream = screamShakeRef.current;
      const live = liveExternal || liveScream;
      const intensity = liveExternal
        ? EXTERNAL_SHAKE_INTENSITY
        : liveScream
          ? SCREAM_SHAKE_INTENSITY
          : intensityRef.current;
      if (intensity <= MIN_INTENSITY && !live) {
        intensityRef.current = 0;
        runningRef.current = false;
        setOffset({ x: 0, y: 0 });
        return;
      }
      intensityRef.current = intensity * SHAKE_DECAY;
      setOffset({
        x: (Math.random() * 2 - 1) * intensity,
        y: (Math.random() * 2 - 1) * intensity,
      });
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    if (externalShake && !runningRef.current) {
      intensityRef.current = EXTERNAL_SHAKE_INTENSITY;
      startLoop();
    }
  }, [externalShake, startLoop]);

  useEffect(() => {
    if (burstActive && !runningRef.current) {
      intensityRef.current = EXTERNAL_SHAKE_INTENSITY * 0.8;
      startLoop();
    }
  }, [burstActive, startLoop]);

  useEffect(() => {
    if (screamShake && !runningRef.current) {
      intensityRef.current = SCREAM_SHAKE_INTENSITY;
      startLoop();
    }
  }, [screamShake, startLoop]);

  useEffect(() => {
    const seen = seenIdsRef.current;
    let added = 0;
    for (const n of damageNumbers) {
      if (seen.has(n.id)) continue;
      seen.add(n.id);
      if (n.value > 0) added += n.value;
    }
    if (added <= 0) return;

    intensityRef.current = Math.min(
      MAX_INTENSITY,
      intensityRef.current +
        Math.min(added, MAX_DAMAGE_FOR_INTENSITY) * INTENSITY_PER_DAMAGE,
    );
    startLoop();
  }, [damageNumbers, startLoop]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return offset;
}
