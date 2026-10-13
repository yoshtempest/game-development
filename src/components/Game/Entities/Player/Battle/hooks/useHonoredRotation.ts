import { useEffect, useState } from "react";

import { HONORED_ONE_RISE_MS } from "@/gameRules/battle/cursedEnergy";

export function useHonoredRotation(isMostHonored: boolean) {
  const [rotationDeg, setRotationDeg] = useState(0);

  useEffect(() => {
    if (!isMostHonored) {
      setRotationDeg(0);
      return;
    }

    const start = performance.now();
    let animationFrame = 0;

    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / HONORED_ONE_RISE_MS);

      setRotationDeg(-30 * progress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isMostHonored]);

  return rotationDeg;
}
