import type { CSSProperties } from "react";
import type { Props } from "./types";


export function BattleBackground({
  effectiveBackground,
  zoom,
  adjustedBgX,
  adjustedBgY,
  shake,
  tvFlash,
}: Props) {
  const bgStyle: CSSProperties = effectiveBackground
    ? {
        backgroundImage: `url(${effectiveBackground})`,
        backgroundSize: `calc(150% * ${zoom})`,
        backgroundPosition: `calc(${adjustedBgX}% + ${shake.x}px) calc(${adjustedBgY}% + ${shake.y}px)`,
      }
    : {};

  return (
    <div className="BackgroundLayer">
      {effectiveBackground && (
        <div className="BackgroundImage" style={bgStyle} />
      )}
      {tvFlash && <div className="tvFlash" />}
    </div>
  );
}