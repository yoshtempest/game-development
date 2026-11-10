import { useLocation } from "react-router";
import { useOnline } from "@/contexts/OnlineContext";
import { playerPath } from "@/utils/paths";

type Props = {
  TILE_SIZE: number;
};

export function RemotePlayers({ TILE_SIZE }: Props) {
  const online = useOnline();
  const location = useLocation();

  if (!online.connected || !online.room) return null;

  const currentScene = location.pathname;
  const remotes = online.room.players.filter(
    (p) => p.id !== online.playerId && p.scene === currentScene,
  );

  if (remotes.length === 0) return null;

  return (
    <>
      {remotes.map((p) => (
        <img
          key={p.id}
          src={playerPath(`/${p.character ?? "drika"}/movement/down.svg`)}
          alt={p.name}
          title={p.name}
          style={{
            position: "absolute",
            left: (p.x ?? 0) * TILE_SIZE,
            top: (p.y ?? 0) * TILE_SIZE * 0.95,
            width: TILE_SIZE * 1.4,
            height: TILE_SIZE * 1.4,
            zIndex: 1000,
            pointerEvents: "none",
          }}
          loading="lazy"
          decoding="async"
        />
      ))}
    </>
  );
}