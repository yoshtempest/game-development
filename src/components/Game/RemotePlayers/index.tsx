import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { useOnline } from "@/contexts/OnlineContext";
import type { OnlinePlayer } from "@/contexts/OnlineContext";
import { Player } from "@/components/Game/Entities/Player";
import { EXPLORE_MOVE_INTERVAL } from "@/gameRules/movement/explore";
import type { CharacterId } from "@/data/characters/list";

type Props = {
  TILE_SIZE: number;
};

type RemotePlayerProps = {
  player: OnlinePlayer;
  TILE_SIZE: number;
  PLAYER_SIZE: number;
};

/**
 * Jogador remoto da exploração. A posição chega por polling (~1s), então a
 * flag `moving` do servidor raramente está ligada no instante da leitura.
 * Derivamos o movimento do delta de posição para manter o sprite
 * `moving<Direction>` durante a mesma janela da transição CSS (300ms) e usamos
 * a direção real do deslocamento como fonte primária.
 */
function RemotePlayer({ player, TILE_SIZE, PLAYER_SIZE }: RemotePlayerProps) {
  const prevPosRef = useRef({ x: player.x ?? 0, y: player.y ?? 0 });
  const movingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [moving, setMoving] = useState(false);
  const [direction, setDirection] = useState<Direction>(
    (player.direction as Direction) ?? "down",
  );

  useEffect(() => {
    const x = player.x ?? 0;
    const y = player.y ?? 0;
    const prev = prevPosRef.current;
    const dx = x - prev.x;
    const dy = y - prev.y;

    if (dx === 0 && dy === 0) {
      // Sem deslocamento: aproveita a direção informada pelo servidor.
      if (player.direction) setDirection(player.direction as Direction);
      return;
    }

    prevPosRef.current = { x, y };

    // Direção real do deslocamento (o eixo dominante vence).
    if (Math.abs(dx) >= Math.abs(dy)) {
      if (dx !== 0) setDirection(dx > 0 ? "right" : "left");
    } else {
      setDirection(dy > 0 ? "down" : "up");
    }

    // A transição de posição do `Player` dura EXPLORE_MOVE_INTERVAL; manter o
    // sprite de movimento pelo mesmo tempo faz a animação acompanhar o slide.
    setMoving(true);
    if (movingTimerRef.current) clearTimeout(movingTimerRef.current);
    movingTimerRef.current = setTimeout(() => {
      movingTimerRef.current = null;
      setMoving(false);
    }, EXPLORE_MOVE_INTERVAL);
  }, [player.x, player.y, player.direction]);

  useEffect(() => {
    return () => {
      if (movingTimerRef.current) clearTimeout(movingTimerRef.current);
    };
  }, []);

  return (
    <Player
      character={(player.character as CharacterId) ?? "drika"}
      direction={direction}
      gridX={player.x ?? 0}
      gridY={player.y ?? 0}
      TILE_SIZE={TILE_SIZE}
      PLAYER_SIZE={PLAYER_SIZE}
      hasPeru={player.hasPeru ?? false}
      moving={moving}
    />
  );
}

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
        <RemotePlayer
          key={p.id}
          player={p}
          TILE_SIZE={TILE_SIZE}
          PLAYER_SIZE={PLAYER_SIZE}
        />
      ))}
    </>
  );
}
