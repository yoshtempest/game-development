import { useEffect } from "react";
import { THREE_HUNDRED_MS } from "@/data/ms";

export function usePlayerPullAnimation(
  setPlayer: React.Dispatch<React.SetStateAction<Player>>,
  isMenuRef?: React.RefObject<boolean>,
) {
  useEffect(() => {
    const interval = setInterval(() => {
      if (isMenuRef?.current) return;
      setPlayer((p) => {
        if (p.pullStartTime === 0) return p;
        const elapsed = Date.now() - p.pullStartTime;
        const duration = p.pullDuration || THREE_HUNDRED_MS;
        const progress = Math.min(elapsed / duration, 1);
        const eased =
          duration >= 400 ? progress : 1 - Math.pow(1 - progress, 3);
        const currentX = p.pullFromX + (p.pullToX - p.pullFromX) * eased;
        if (progress >= 1) {
          return { ...p, x: p.pullToX, pullStartTime: 0, pullDuration: 300 };
        }
        return { ...p, x: currentX };
      });
    }, 16);
    return () => clearInterval(interval);
  }, [setPlayer, isMenuRef]);
}
