import { useEffect } from "react";
import { rootAssetPath } from "@/utils/paths";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";

export function LoadingScreen() {
  const { playSound } = useSoundEffects();

  useEffect(() => {
    playSound("loading");
  }, [playSound]);

  return (
    <div className="loading-screen">
      <img
        loading="lazy"
        decoding="async"
        className="loading-logo"
        src={rootAssetPath("logo.svg")}
      />
    </div>
  );
}
