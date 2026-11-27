import {
  GAMEROOM_BASE_URL,
  GAMEROOM_GAME_SLUG,
  getGameRoomGame,
  resolveGameRoomWebSocketUrl,
} from "@/services/gameroom";

export type BattleSocketMessage = {
  type: string;
  [key: string]: unknown;
};

type Listener = (msg: BattleSocketMessage) => void;

type Session = {
  playerId: string;
  resumeToken: string;
  roomCode: string;
};

const RESUME_TOKEN_KEY = "jomasio_gameroom_resume_token";

function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(RESUME_TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (
      typeof parsed.playerId === "string" &&
      typeof parsed.resumeToken === "string" &&
      typeof parsed.roomCode === "string"
    ) {
      return parsed as Session;
    }
  } catch {
    // ignore
  }
  return null;
}

function writeSession(session: Session | null): void {
  try {
    if (session) sessionStorage.setItem(RESUME_TOKEN_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(RESUME_TOKEN_KEY);
  } catch {
    // ignore
  }
}

type Entry = {
  ws: WebSocket | null;
  refs: number;
  roomId: string;
  connected: boolean;
  reconnecting: boolean;
  shouldConnect: boolean;
  retries: number;
  timer: ReturnType<typeof setTimeout> | null;
  requestId: number;
  listeners: Map<string, Set<Listener>>;
  anyListeners: Set<Listener>;
  statusListeners: Set<() => void>;
  lastMessage: BattleSocketMessage | null;
};

const entries = new Map<string, Entry>();

function notifyStatus(entry: Entry) {
  for (const l of entry.statusListeners) l();
}

function emit(entry: Entry, msg: BattleSocketMessage) {
  entry.lastMessage = msg;
  const listeners = entry.listeners.get(msg.type);
  if (listeners) for (const l of listeners) l(msg);
  for (const l of entry.anyListeners) l(msg);
  // Gameroom sinaliza início com room_state playing; o app antigo usava "play".
  if (msg.type === "room_state" && msg.state === "playing") {
    const synthetic: BattleSocketMessage = { type: "play" };
    const playListeners = entry.listeners.get("play");
    if (playListeners) for (const l of playListeners) l(synthetic);
    for (const l of entry.anyListeners) l(synthetic);
  }
  notifyStatus(entry);
}

async function connectEntry(entry: Entry) {
  if (!entry.shouldConnect) return;
  const requestId = ++entry.requestId;
  try {
    const game = await getGameRoomGame(GAMEROOM_BASE_URL, GAMEROOM_GAME_SLUG);
    if (requestId !== entry.requestId || !entry.shouldConnect) return;
    const url = resolveGameRoomWebSocketUrl(GAMEROOM_BASE_URL, game.websocket_path);
    const ws = new WebSocket(url);
    entry.ws = ws;

    ws.onopen = () => {
      if (entry.ws !== ws) return;
      entry.connected = true;
      entry.reconnecting = false;
      entry.retries = 0;
      notifyStatus(entry);
      if (entry.roomId === "__lobby__") return;
      const session = readSession();
      const playerName = localStorage.getItem("playerName") ?? "Jogador";
      if (session && session.roomCode === entry.roomId) {
        ws.send(
          JSON.stringify({
            type: "resume",
            player_id: session.playerId,
            resume_token: session.resumeToken,
          }),
        );
      } else {
        ws.send(JSON.stringify({ type: "join", code: entry.roomId, name: playerName }));
      }
    };

    ws.onmessage = (event) => {
      if (entry.ws !== ws) return;
      try {
        const msg = JSON.parse(String(event.data)) as BattleSocketMessage;
        if (msg.type === "welcome") {
          const room = msg.room as { code?: string } | undefined;
          const playerId =
            typeof msg.player_id === "string" ? msg.player_id : "";
          const resumeToken =
            typeof msg.resume_token === "string" ? msg.resume_token : "";
          const session: Session = {
            playerId,
            resumeToken,
            roomCode: room?.code ?? entry.roomId,
          };
          if (session.playerId && session.resumeToken && session.roomCode) {
            writeSession(session);
          }
        }
        if (msg.type === "left") writeSession(null);
        emit(entry, msg);
      } catch {
        // ignore
      }
    };

    ws.onclose = () => {
      if (entry.ws !== ws) return;
      entry.ws = null;
      entry.connected = false;
      notifyStatus(entry);
      if (!entry.shouldConnect) return;
      if (entry.retries >= 6) {
        entry.reconnecting = false;
        notifyStatus(entry);
        return;
      }
      entry.reconnecting = true;
      const delay = Math.min(1000 * 2 ** entry.retries, 10000);
      entry.retries += 1;
      notifyStatus(entry);
      if (entry.timer) clearTimeout(entry.timer);
      entry.timer = setTimeout(() => {
        if (entry.shouldConnect) void connectEntry(entry);
      }, delay);
    };
  } catch {
    if (requestId !== entry.requestId || !entry.shouldConnect) return;
    entry.connected = false;
    if (entry.retries >= 6) {
      entry.reconnecting = false;
      notifyStatus(entry);
      return;
    }
    entry.reconnecting = true;
    const delay = Math.min(1000 * 2 ** entry.retries, 10000);
    entry.retries += 1;
    notifyStatus(entry);
    if (entry.timer) clearTimeout(entry.timer);
    entry.timer = setTimeout(() => {
      if (entry.shouldConnect) void connectEntry(entry);
    }, delay);
  }
}

export function acquireGameRoomSocket(roomId: string) {
  let entry = entries.get(roomId);
  if (!entry) {
    entry = {
      ws: null,
      refs: 0,
      roomId,
      connected: false,
      reconnecting: false,
      shouldConnect: true,
      retries: 0,
      timer: null,
      requestId: 0,
      listeners: new Map(),
      anyListeners: new Set(),
      statusListeners: new Set(),
      lastMessage: null,
    };
    entries.set(roomId, entry);
    void connectEntry(entry);
  }
  entry.refs += 1;

  return {
    entry,
    release(sendLeave: boolean) {
      entry.refs -= 1;
      if (entry.refs > 0) return;
      entry.shouldConnect = false;
      entry.requestId += 1;
      if (entry.timer) clearTimeout(entry.timer);
      const ws = entry.ws;
      entry.ws = null;
      if (ws) {
        if (sendLeave && ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(JSON.stringify({ type: "leave" }));
          } catch {
            // ignore
          }
        }
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        ws.onerror = null;
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) ws.close();
      }
      entries.delete(roomId);
    },
  };
}

export function sendGameRoomMessage(entry: Entry, msg: BattleSocketMessage) {
  const ws = entry.ws;
  if (ws && ws.readyState === WebSocket.OPEN) {
    const wire =
      msg.type === "play"
        ? { ...msg, type: "start" }
        : msg;
    ws.send(JSON.stringify(wire));
    return true;
  }
  return false;
}

export function subscribeGameRoomMessage(
  entry: Entry,
  type: string,
  listener: Listener,
) {
  let listeners = entry.listeners.get(type);
  if (!listeners) {
    listeners = new Set();
    entry.listeners.set(type, listeners);
  }
  listeners.add(listener);
  return () => {
    listeners?.delete(listener);
    if (listeners?.size === 0) entry.listeners.delete(type);
  };
}

export function subscribeGameRoomAny(entry: Entry, listener: Listener) {
  entry.anyListeners.add(listener);
  return () => {
    entry.anyListeners.delete(listener);
  };
}

export function subscribeGameRoomStatus(entry: Entry, listener: () => void) {
  entry.statusListeners.add(listener);
  return () => {
    entry.statusListeners.delete(listener);
  };
}

export function getGameRoomSession() {
  return readSession();
}
