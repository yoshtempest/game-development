
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useOnline } from "@/contexts/OnlineContext";
import { useBattleSocket } from "@/hooks/useBattleSocket";

const GAME_ROUTE = "/jomasioentrance/one";

export function useOnlineLobby() {
  const navigate = useNavigate();
  const online = useOnline();

  const {
    rooms,
    connected,
    room,
    createRoom,
    joinRoom,
    leaveRoom,
    refreshRooms,
    playerId,
  } = online;

  const { send, lastMessage } = useBattleSocket(
    online.roomId,
    online.playerId
  );

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  const isHost = room?.hostId === playerId;

  useEffect(() => {
    if (isHost || lastMessage?.type !== "play") return;

    const route = lastMessage.route || GAME_ROUTE;
    void navigate(route);
  }, [isHost, lastMessage, navigate]);

  const create = async () => {
    if (!name.trim()) return;

    await createRoom(name.trim());
  };

  const join = async (id: string) => {
    const result = await joinRoom(id);

    if (result) {
      void navigate(GAME_ROUTE);
    }
  };

  const joinByCode = async () => {
    const trimmed = code.trim();

    if (!trimmed) return;

    setCodeError(null);

    const result = await joinRoom(trimmed);

    if (result) {
      void navigate(GAME_ROUTE);
      return;
    }

    setCodeError("Sala não encontrada.");
  };

  const play = () => {
    send({
      type: "play",
      route: GAME_ROUTE,
    });

    void navigate(GAME_ROUTE);
  };

  return {
    rooms,
    connected,
    room,
    playerId,
    roomId: online.roomId,
    isHost,

    name,
    setName,
    code,
    setCode,
    codeError,

    create,
    join,
    joinByCode,
    leaveRoom,
    refreshRooms,
    play,
  };
}
