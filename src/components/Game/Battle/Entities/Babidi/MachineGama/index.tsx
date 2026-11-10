import type { MachineGamaState } from "@/hooks/battle/player/characters/babidi/domainExpansion/useBabidiDomainExpansion";
import { npcPathProjectile, playerAbilityPath } from "@/utils/paths";

type Props = {
  machineGama: MachineGamaState;
};

export function BabidiMachineGama({ machineGama }: Props) {
  if (!machineGama) return null;

  return (
    <>
      {machineGama.state === "exploding" && (
        <style>{`
          @keyframes mg-shake {
            0% { transform: translate(-50%, -100%) translate(0,0); }
            25% { transform: translate(-50%, -100%) translate(2px,-2px); }
            50% { transform: translate(-50%, -100%) translate(-2px,2px); }
            75% { transform: translate(-50%, -100%) translate(2px,2px); }
            100% { transform: translate(-50%, -100%) translate(-2px,-2px); }
          }
           @keyframes mg-fade { 0% { opacity: 0.8; } 100% { opacity: 0; } }
        `}</style>
      )}
      <img
        loading="lazy"
        decoding="async"
        src={playerAbilityPath(
          "babidi",
          "domainExpansion",
          `machineGama/${machineGama.state}.svg`,
        )}
        style={{
          position: "absolute",
          left: machineGama.x,
          top: machineGama.y,
          transform: "translate(-50%, -100%)",
          width: 200,
          height: 200,
          zIndex: 15,
          pointerEvents: "none",
          animation:
            machineGama.state === "exploding"
              ? "mg-shake 0.1s infinite, mg-fade 1.2s forwards"
              : undefined,
          opacity: machineGama.state === "exploding" ? 0.8 : 1,
        }}
        alt="Machine Gama"
      />
      {machineGama.state === "exploding" &&
        Array.from({ length: 8 }).map((_, i) => (
          <img
            loading="lazy"
            decoding="async"
            key={i}
            src={npcPathProjectile("/explosion.svg")}
            style={{
              position: "absolute",
              left: machineGama.x + Math.cos((i / 8) * Math.PI * 2) * 60,
              top: machineGama.y + Math.sin((i / 8) * Math.PI * 2) * 60,
              width: 60,
              height: 60,
              zIndex: 16,
              pointerEvents: "none",
            }}
            alt="explosion"
          />
        ))}
    </>
  );
}