import type { CharacterId } from "@/data/characters/list";
import { playerPath } from "@/utils/paths";

type Props = {
  character: CharacterId;
  playerX: number;
  playerY: number;
  pentagramVisible: boolean;
  selectedArmIcon: string | null;
};

export function DrikaSigiloOverlay({
  character,
  playerX,
  playerY,
  pentagramVisible,
  selectedArmIcon,
}: Props) {
  if (character !== "drika") return null;

  return (
    <>
      {pentagramVisible && (
        <>
          <style>{`@keyframes sigiloFadeIn { from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }`}</style>
          <img
            src={playerPath("/drika/inFight/habilities/sigilo/pentagram.svg")}
            alt="pentagram"
            style={{
              position: "absolute",
              left: playerX,
              top: playerY,
              transform: "translate(-50%, -50%)",
              animation: "sigiloFadeIn 0.3s ease forwards",
              pointerEvents: "none",
              zIndex: 5,
            }}
          />
        </>
      )}

      {selectedArmIcon && (
        <img
          src={playerPath(`/drika/inFight/arms/${selectedArmIcon}`)}
          alt="selected arm"
          style={{
            position: "absolute",
            left: playerX,
            top: playerY - 40,
            transform: "translate(-50%, -100%)",
            pointerEvents: "none",
            zIndex: 6,
          }}
        />
      )}
    </>
  );
}
