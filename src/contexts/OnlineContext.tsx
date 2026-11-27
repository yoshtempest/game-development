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

import {
  ONLINE_GUILD_SESSION_KEY,
  ONLINE_ROOM_SESSION_KEY,
} from "@/data/storageKeys";
import {
  GAMEROOM_BASE_URL,
  GAMEROOM_GAME_SLUG,
  getGameRoomGame,
  resolveGameRoomWebSocketUrl,
} from "@/services/gameroom";
import type { GameRoomPlayer } from "@/services/gameroom";

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
const GAMEROOM_RESUME_KEY = "jomasio_gameroom_resume_token";

type GameRoomSession = {
  playerId: string;
  resumeToken: string;
  roomCode: string;
};

function readSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSession(key: string, value: string | null): void {
  try {
    if (value) sessionStorage.setItem(key, value);
    else sessionStorage.removeItem(key);
  } catch {
    return;
  }
}

function readGameroomSession(): GameRoomSession | null {
  try {
    const raw = sessionStorage.getItem(GAMEROOM_RESUME_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GameRoomSession>;
    if (
      typeof parsed.playerId === "string" &&
      typeof parsed.resumeToken === "string" &&
      typeof parsed.roomCode === "string"
    ) {
      return parsed as GameRoomSession;
    }
  } catch {
    // ignore
  }
  return null;
}

function writeGameroomSession(session: GameRoomSession | null): void {
  try {
    if (session)
      sessionStorage.setItem(GAMEROOM_RESUME_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(GAMEROOM_RESUME_KEY);
  } catch {
    // ignore
  }
}

function getPlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

function mapRoom(
  room: {
    code: string;
    host_id: string | null;
    players: GameRoomPlayer[];
  },
  prev: OnlineRoom | null,
  playerState: Record<string, Partial<OnlinePlayer>>,
): OnlineRoom {
  const prevPlayers = new Map((prev?.players ?? []).map((p) => [p.id, p]));
  return {
    id: room.code,
    name: prev?.id === room.code ? prev.name : `Sala ${room.code}`,
    hostId: room.host_id ?? "",
    createdAt: prev?.id === room.code ? prev.createdAt : Date.now(),
    players: room.players.map((p) => {
      const old = prevPlayers.get(p.player_id);
      const state = playerState[p.player_id] ?? {};
      return {
        ...old,
        ...state,
        // gameroom é a fonte de verdade para presença/identidade
        id: p.player_id,
        name: p.name,
        updatedAt: Date.now(),
      };
    }),
  };
}

export function OnlineProvider({ children }: { children: ReactNode }) {
  const localPlayerId = useMemo(getPlayerId, []);
  const [playerName] = useState(
    () => localStorage.getItem("playerName") ?? "Jogador",
  );
  const [gameroomPlayerId, setGameroomPlayerId] = useState<string | null>(
    () => readGameroomSession()?.playerId ?? null,
  );
  const playerId = gameroomPlayerId ?? localPlayerId;
  const [roomId, setRoomId] = useState<string | null>(null);
  const [room, setRoom] = useState<OnlineRoom | null>(null);
  const [rooms, setRooms] = useState<OnlineRoom[]>([]);
  const [guildId, setGuildId] = useState<string | null>(() =>
    readSession(ONLINE_GUILD_SESSION_KEY),
  );
  const stateRef = useRef<Record<string, Partial<OnlinePlayer>>>({});
  const localStateRef = useRef<{
    scene?: string;
    x?: number;
    y?: number;
    character?: string;
    direction?: string;
    moving?: boolean;
    hasPeru?: boolean;
    guildId?: string | null;
  }>({});

  const wsRef = useRef<WebSocket | null>(null);
  const shouldConnectRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retriesRef = useRef(0);
  const connectRequestRef = useRef(0);
  const roomRef = useRef<OnlineRoom | null>(null);
  roomRef.current = room;

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const applyRoomMessage = useCallback(
    (msg: Record<string, unknown>) => {
      const roomPayload = msg.room as
        | { code: string; host_id: string | null; players: GameRoomPlayer[] }
        | undefined;
      if (roomPayload && typeof roomPayload.code === "string") {
        const mapped = mapRoom(
          roomPayload,
          roomRef.current,
          stateRef.current,
        );
        setRoomId(mapped.id);
        setRoom(mapped);
        writeSession(ONLINE_ROOM_SESSION_KEY, mapped.id);
        const pid = typeof msg.player_id === "string" ? msg.player_id : null;
        const token =
          typeof msg.resume_token === "string" ? msg.resume_token : null;
        if (pid && token) {
          setGameroomPlayerId(pid);
          writeGameroomSession({
            playerId: pid,
            resumeToken: token,
            roomCode: mapped.id,
          });
        }
        return;
      }

      if (msg.type === "player_joined") {
        const p = msg.player as GameRoomPlayer | undefined;
        if (!p) return;
        setRoom((prev) => {
          if (!prev) return prev;
          if (prev.players.some((x) => x.id === p.player_id)) return prev;
          const next = {
            ...prev,
            players: [
              ...prev.players,
              {
                ...(stateRef.current[p.player_id] ?? {}),
                id: p.player_id,
                name: p.name,
                updatedAt: Date.now(),
              },
            ],
          };
          roomRef.current = next;
          return next;
        });
        return;
      }

      if (msg.type === "player_left") {
        const leftId = typeof msg.player_id === "string" ? msg.player_id : null;
        if (!leftId) return;
        setRoom((prev) => {
          if (!prev) return prev;
          const next = {
            ...prev,
            players: prev.players.filter((p) => p.id !== leftId),
          };
          roomRef.current = next;
          return next;
        });
        return;
      }

      if (msg.type === "host_changed") {
        const hostId = typeof msg.host_id === "string" ? msg.host_id : "";
        setRoom((prev) => {
          if (!prev) return prev;
          const next = { ...prev, hostId };
          roomRef.current = next;
          return next;
        });
        return;
      }

      if (msg.type === "left") {
        writeSession(ONLINE_ROOM_SESSION_KEY, null);
        writeGameroomSession(null);
        setRoomId(null);
        setRoom(null);
        roomRef.current = null;
      }
    },
    [],
  );

  const connectWs = useCallback(async () => {
    if (!shouldConnectRef.current) return;
    const requestId = ++connectRequestRef.current;
    try {
      const game = await getGameRoomGame(GAMEROOM_BASE_URL, GAMEROOM_GAME_SLUG);
      if (requestId !== connectRequestRef.current || !shouldConnectRef.current) {
        return;
      }
      const url = resolveGameRoomWebSocketUrl(
        GAMEROOM_BASE_URL,
        game.websocket_path,
      );
      const ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onopen = () => {
        if (wsRef.current !== ws) return;
        retriesRef.current = 0;
        const session = readGameroomSession();
        const storedRoom = readSession(ONLINE_ROOM_SESSION_KEY);
        if (session && storedRoom && session.roomCode === storedRoom) {
          ws.send(
            JSON.stringify({
              type: "resume",
              player_id: session.playerId,
              resume_token: session.resumeToken,
            }),
          );
        }
      };
      ws.onmessage = (event) => {
        if (wsRef.current !== ws) return;
        try {
          const msg = JSON.parse(String(event.data)) as Record<string, unknown>;
          applyRoomMessage(msg);
        } catch {
          // ignore
        }
      };
      ws.onclose = () => {
        if (wsRef.current !== ws) return;
        wsRef.current = null;
        if (!shouldConnectRef.current) return;
        if (retriesRef.current >= 6) return;
        const delay = Math.min(1000 * 2 ** retriesRef.current, 10000);
        retriesRef.current += 1;
        clearReconnectTimer();
        reconnectTimerRef.current = setTimeout(() => {
          void connectWs();
        }, delay);
      };
    } catch {
      if (requestId !== connectRequestRef.current || !shouldConnectRef.current) {
        return;
      }
      if (retriesRef.current >= 6) return;
      const delay = Math.min(1000 * 2 ** retriesRef.current, 10000);
      retriesRef.current += 1;
      clearReconnectTimer();
      reconnectTimerRef.current = setTimeout(() => {
        void connectWs();
      }, delay);
    }
  }, [applyRoomMessage, clearReconnectTimer]);

  useEffect(() => {
    shouldConnectRef.current = true;
    void connectWs();
    return () => {
      shouldConnectRef.current = false;
      connectRequestRef.current += 1;
      clearReconnectTimer();
      const ws = wsRef.current;
      wsRef.current = null;
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        ws.onerror = null;
        if (
          ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING
        ) {
          ws.close();
        }
      }
    };
  }, [connectWs, clearReconnectTimer]);

  const sendWs = useCallback((msg: Record<string, unknown>) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
      return true;
    }
    return false;
  }, []);

  const waitForWelcome = useCallback(
    (code?: string) =>
      new Promise<OnlineRoom | null>((resolve) => {
        const ws = wsRef.current;
        if (!ws) {
          resolve(null);
          return;
        }
        const timeout = setTimeout(() => {
          ws.removeEventListener("message", onMessage);
          resolve(null);
        }, 6000);
        const onMessage = (event: MessageEvent) => {
          try {
            const msg = JSON.parse(String(event.data)) as Record<string, unknown>;
            if (msg.type === "welcome") {
              const roomPayload = msg.room as
                | {
                    code: string;
                    host_id: string | null;
                    players: GameRoomPlayer[];
                  }
                | undefined;
              if (!code || roomPayload?.code === code) {
                clearTimeout(timeout);
                ws.removeEventListener("message", onMessage);
                const mapped = roomPayload
                  ? mapRoom(roomPayload, roomRef.current, stateRef.current)
                  : null;
                if (mapped) {
                  setRoomId(mapped.id);
                  setRoom(mapped);
                  roomRef.current = mapped;
                  writeSession(ONLINE_ROOM_SESSION_KEY, mapped.id);
                  const pid =
                    typeof msg.player_id === "string" ? msg.player_id : null;
                  const token =
                    typeof msg.resume_token === "string"
                      ? msg.resume_token
                      : null;
                  if (pid && token) {
                    setGameroomPlayerId(pid);
                    writeGameroomSession({
                      playerId: pid,
                      resumeToken: token,
                      roomCode: mapped.id,
                    });
                  }
                }
                resolve(mapped);
              }
            }
            if (msg.type === "error") {
              clearTimeout(timeout);
              ws.removeEventListener("message", onMessage);
              resolve(null);
            }
          } catch {
            // ignore
          }
        };
        ws.addEventListener("message", onMessage);
      }),
    [],
  );

  const refreshRooms = useCallback(() => {
    // Gameroom não expõe listagem de salas; mantemos a sala atual como referência.
    setRooms((prev) => {
      if (roomRef.current) return [roomRef.current];
      return prev.length ? prev : [];
    });
    return Promise.resolve();
  }, []);

  const createRoom = useCallback(
    async (name: string) => {
      const ok = sendWs({ type: "create", name: playerName || name });
      if (!ok) return null;
      const created = await waitForWelcome();
      if (created) {
        const named = { ...created, name: name || created.name };
        setRoom(named);
        roomRef.current = named;
        return named;
      }
      return null;
    },
    [sendWs, waitForWelcome, playerName],
  );

  const joinRoom = useCallback(
    async (id: string) => {
      const code = id.trim().toUpperCase();
      const ok = sendWs({ type: "join", code, name: playerName });
      if (!ok) return null;
      return waitForWelcome(code);
    },
    [sendWs, waitForWelcome, playerName],
  );

  const leaveRoom = useCallback(() => {
    sendWs({ type: "leave" });
    writeSession(ONLINE_ROOM_SESSION_KEY, null);
    writeGameroomSession(null);
    setRoomId(null);
    setRoom(null);
    roomRef.current = null;
    setGuildId(null);
    return Promise.resolve();
  }, [sendWs]);

  useEffect(() => {
    if (roomId) writeSession(ONLINE_ROOM_SESSION_KEY, roomId);
  }, [roomId]);

  useEffect(() => {
    writeSession(ONLINE_GUILD_SESSION_KEY, guildId);
  }, [guildId]);

  useEffect(() => {
    localStateRef.current = { ...localStateRef.current, guildId };
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
      localStateRef.current = { ...localStateRef.current, ...state };
      const id = gameroomPlayerId ?? localPlayerId;
      stateRef.current[id] = { ...(stateRef.current[id] ?? {}), ...state };
      setRoom((prev) => {
        if (!prev) return prev;
        const next = {
          ...prev,
          players: prev.players.map((p) =>
            p.id === id ? { ...p, ...state, updatedAt: Date.now() } : p,
          ),
        };
        roomRef.current = next;
        return next;
      });
    },
    [gameroomPlayerId, localPlayerId],
  );

  useEffect(() => {
    void refreshRooms();
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
