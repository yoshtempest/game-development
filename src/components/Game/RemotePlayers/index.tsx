import { useLocation } from "react-router";
import { useOnline } from "@/contexts/OnlineContext";
import { Player } from "@/components/Game/Entities/Player";
import type { CharacterId } from "@/data/characters/list";

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

  const PLAYER_SIZE = TILE_SIZE * 1.4;

  return (
    <>
      {remotes.map((p) => (
        <Player
          key={p.id}
          character={(p.character as CharacterId) ?? "drika"}
          direction={(p.direction as Direction) ?? "down"}
          gridX={p.x ?? 0}
          gridY={p.y ?? 0}
          TILE_SIZE={TILE_SIZE}
          PLAYER_SIZE={PLAYER_SIZE}
          hasPeru={p.hasPeru ?? false}
          moving={p.moving ?? false}
        />
      ))}
    </>
  );
}