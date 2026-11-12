import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type OnlinePlayer = {
  id: string;
  name: string;
  character?: string;
  scene?: string;
  x?: number;
  y?: number;
  direction?: string;
  moving?: boolean;
  hasPeru?: boolean;
  guildId?: string | null;
  updatedAt: number;
};

type OnlineRoom = {
  id: string;
  name: string;
  hostId: string;
  players: OnlinePlayer[];
  createdAt: number;
};

type OnlineContextValue = {
  playerId: string;
  playerName: string;
  roomId: string | null;
  room: OnlineRoom | null;
  rooms: OnlineRoom[];
  connected: boolean;
  guildId: string | null;
  setGuildId: (id: string | null) => void;
  createRoom: (name: string) => Promise<OnlineRoom | null>;
  joinRoom: (id: string) => Promise<OnlineRoom | null>;
  leaveRoom: () => Promise<void>;
  refreshRooms: () => Promise<void>;
  updateState: (state: {
    scene?: string;
    x?: number;
    y?: number;
    character?: string;
    direction?: string;
    moving?: boolean;
    hasPeru?: boolean;
    guildId?: string | null;
  }) => void;
};

const OnlineContext = createContext<OnlineContextValue | null>(null);

const PLAYER_ID_KEY = "jomasio_online_player_id";

function getPlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

export function OnlineProvider({ children }: { children: ReactNode }) {
  const playerId = useMemo(getPlayerId, []);
  const [playerName] = useState(
    () => localStorage.getItem("playerName") ?? "Jogador",
  );
  const [roomId, setRoomId] = useState<string | null>(null);
  const [room, setRoom] = useState<OnlineRoom | null>(null);
  const [rooms, setRooms] = useState<OnlineRoom[]>([]);
  const [guildId, setGuildId] = useState<string | null>(null);
  const stateRef = useRef<{
    scene?: string;
    x?: number;
    y?: number;
    character?: string;
    direction?: string;
    moving?: boolean;
    hasPeru?: boolean;
    guildId?: string | null;
  }>({});

  const refreshRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/online/rooms");
      if (!res.ok) return;
      const data = (await res.json()) as OnlineRoom[];
      setRooms(data);
    } catch {
      // backend opcional: silencioso
    }
  }, []);

  const createRoom = useCallback(
    async (name: string) => {
      try {
        const res = await fetch("/api/online/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, hostId: playerId, playerName }),
        });
        if (!res.ok) return null;
        const data = (await res.json()) as OnlineRoom;
        setRoomId(data.id);
        setRoom(data);
        return data;
      } catch {
        return null;
      }
    },
    [playerId, playerName],
  );

  const joinRoom = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/online/rooms/${id}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, playerName }),
        });
        if (!res.ok) return null;
        const data = (await res.json()) as OnlineRoom;
        setRoomId(data.id);
        setRoom(data);
        return data;
      } catch {
        return null;
      }
    },
    [playerId, playerName],
  );

  const leaveRoom = useCallback(async () => {
    if (!roomId) return;
    try {
      await fetch(`/api/online/rooms/${roomId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
    } catch {
      // ignore
    }
    setRoomId(null);
    setRoom(null);
  }, [roomId, playerId]);

  useEffect(() => {
    stateRef.current = { ...stateRef.current, guildId };
  }, [guildId]);

  const updateState = useCallback(
    (state: {
      scene?: string;
      x?: number;
      y?: number;
      character?: string;
      direction?: string;
      moving?: boolean;
      hasPeru?: boolean;
      guildId?: string | null;
    }) => {
      stateRef.current = { ...stateRef.current, ...state };
    },
    [],
  );

  // polling de sala + envio de estado
  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/online/rooms/${roomId}`);
        if (res.ok) {
          const data = (await res.json()) as OnlineRoom;
          if (!cancelled) setRoom(data);
        }
      } catch {
        // ignore
      }
      // envia estado atual
      try {
        await fetch(`/api/online/rooms/${roomId}/state`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, ...stateRef.current }),
        });
      } catch {
        // ignore
      }
    };
    void tick();
    const interval = setInterval(() => void tick(), 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [roomId, playerId]);

  // polling de salas disponíveis
  useEffect(() => {
    void refreshRooms();
    const interval = setInterval(() => void refreshRooms(), 3000);
    return () => clearInterval(interval);
  }, [refreshRooms]);

  const value = useMemo<OnlineContextValue>(
    () => ({
      playerId,
      playerName,
      roomId,
      room,
      rooms,
      connected: roomId !== null,
      guildId,
      setGuildId,
      createRoom,
      joinRoom,
      leaveRoom,
      refreshRooms,
      updateState,
    }),
    [
      playerId,
      playerName,
      roomId,
      room,
      rooms,
      guildId,
      setGuildId,
      createRoom,
      joinRoom,
      leaveRoom,
      refreshRooms,
      updateState,
    ],
  );

  return (
    <OnlineContext.Provider value={value}>{children}</OnlineContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOnline() {
  const ctx = useContext(OnlineContext);
  if (!ctx) throw new Error("useOnline precisa do OnlineProvider");
  return ctx;
}
