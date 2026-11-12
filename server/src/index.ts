import express from "express";
import cors from "cors";
import http from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import authRoutes from "./routes/auth.js";
import saveRoutes from "./routes/save.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "5mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/save", saveRoutes);

// ---------------------------------------------------------------------------
// Modo online (protótipo): salas em memória para jogadores na mesma rede.
// ---------------------------------------------------------------------------
type OnlinePlayer = {
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
  players: Map<string, OnlinePlayer>;
  createdAt: number;
};

const rooms = new Map<string, OnlineRoom>();

function roomToJSON(room: OnlineRoom) {
  return {
    id: room.id,
    name: room.name,
    hostId: room.hostId,
    players: Array.from(room.players.values()),
    createdAt: room.createdAt,
  };
}

app.get("/api/online/rooms", (_req, res) => {
  res.json(Array.from(rooms.values()).map(roomToJSON));
});

app.post("/api/online/rooms", (req, res) => {
  const { name, hostId, playerName } = req.body ?? {};
  if (!name || !hostId) {
    res.status(400).json({ error: "name e hostId são obrigatórios" });
    return;
  }
  const id = `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const room: OnlineRoom = {
    id,
    name: String(name),
    hostId: String(hostId),
    players: new Map(),
    createdAt: Date.now(),
  };
  room.players.set(String(hostId), {
    id: String(hostId),
    name: String(playerName ?? "Jogador"),
    updatedAt: Date.now(),
  });
  rooms.set(id, room);
  res.json(roomToJSON(room));
});

app.post("/api/online/rooms/:id/join", (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) {
    res.status(404).json({ error: "sala não encontrada" });
    return;
  }
  const { playerId, playerName, character } = req.body ?? {};
  if (!playerId) {
    res.status(400).json({ error: "playerId é obrigatório" });
    return;
  }
  room.players.set(String(playerId), {
    id: String(playerId),
    name: String(playerName ?? "Jogador"),
    character,
    updatedAt: Date.now(),
  });
  broadcastRoom(room);
  res.json(roomToJSON(room));
});

app.post("/api/online/rooms/:id/leave", (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) {
    res.status(404).json({ error: "sala não encontrada" });
    return;
  }
  const { playerId } = req.body ?? {};
  if (playerId) room.players.delete(String(playerId));
  if (room.players.size === 0) rooms.delete(room.id);
  else broadcastRoom(room);
  res.json({ ok: true });
});

app.post("/api/online/rooms/:id/state", (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) {
    res.status(404).json({ error: "sala não encontrada" });
    return;
  }
  const { playerId, scene, x, y, character, direction, moving, hasPeru, guildId } =
    req.body ?? {};
  if (!playerId || !room.players.has(String(playerId))) {
    res.status(400).json({ error: "jogador não está na sala" });
    return;
  }
  const player = room.players.get(String(playerId))!;
  room.players.set(String(playerId), {
    ...player,
    scene,
    x,
    y,
    character: character ?? player.character,
    direction: direction ?? player.direction,
    moving: moving ?? player.moving,
    hasPeru: hasPeru ?? player.hasPeru,
    guildId: guildId ?? player.guildId,
    updatedAt: Date.now(),
  });
  broadcastRoom(room);
  res.json({ ok: true });
});

app.get("/api/online/rooms/:id", (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) {
    res.status(404).json({ error: "sala não encontrada" });
    return;
  }
  res.json(roomToJSON(room));
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ---------------------------------------------------------------------------
// WebSocket: tempo real para salas/batalha
// ---------------------------------------------------------------------------
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

const socketMeta = new WeakMap<WebSocket, { playerId?: string; roomId?: string }>();

/**
 * Vários componentes abrem um socket para a mesma sala (GameApp, SocialOverlay,
 * BattleScene). Um deles fechar não pode remover o jogador da sala enquanto
 * outro socket do mesmo jogador continuar aberto — senão o parceiro de guilda
 * deixa de vê-lo depois da primeira batalha.
 */
function hasOtherSocket(
  roomId: string,
  playerId: string,
  except: WebSocket,
): boolean {
  for (const client of wss.clients) {
    if (client === except) continue;
    if (client.readyState !== WebSocket.OPEN) continue;
    const meta = socketMeta.get(client);
    if (meta?.roomId === roomId && meta?.playerId === playerId) return true;
  }
  return false;
}

function broadcastRoom(room: OnlineRoom) {
  const payload = JSON.stringify({ type: "roomState", room: roomToJSON(room) });
  for (const ws of wss.clients) {
    if (ws.readyState !== WebSocket.OPEN) continue;
    const meta = socketMeta.get(ws);
    if (meta?.roomId === room.id) ws.send(payload);
  }
}

/**
 * Repassa uma mensagem para todos os sockets da sala. O servidor não interpreta
 * o estado de batalha: `to`/`from` deixam o cliente filtrar o co-op de guilda,
 * já que o mesmo canal também carrega PvP e convites.
 */
function relayRoom(roomId: string, payload: Record<string, unknown>) {
  const data = JSON.stringify(payload);
  for (const ws of wss.clients) {
    if (ws.readyState !== WebSocket.OPEN) continue;
    const meta = socketMeta.get(ws);
    if (meta?.roomId === roomId) ws.send(data);
  }
}

wss.on("connection", (ws) => {
  socketMeta.set(ws, {});

  ws.on("message", (raw) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let msg: any;
    try {
      msg = JSON.parse(String(raw));
    } catch {
      return;
    }

    const meta = socketMeta.get(ws)!;

    if (msg.type === "joinRoom") {
      const room = rooms.get(msg.roomId);
      if (!room) {
        ws.send(JSON.stringify({ type: "error", message: "sala não encontrada" }));
        return;
      }
      meta.playerId = msg.playerId;
      meta.roomId = msg.roomId;
      if (!room.players.has(msg.playerId)) {
        room.players.set(msg.playerId, {
          id: msg.playerId,
          name: msg.playerName ?? "Jogador",
          updatedAt: Date.now(),
        });
      }
      ws.send(JSON.stringify({ type: "roomState", room: roomToJSON(room) }));
      broadcastRoom(room);
      return;
    }

    if (msg.type === "leaveRoom") {
      const room = rooms.get(msg.roomId ?? meta.roomId ?? "");
      const playerId = msg.playerId ?? meta.playerId;
      if (room && playerId && !hasOtherSocket(room.id, playerId, ws)) {
        room.players.delete(playerId);
        if (room.players.size === 0) rooms.delete(room.id);
        else broadcastRoom(room);
      }
      meta.roomId = undefined;
      meta.playerId = undefined;
      return;
    }

    if (msg.type === "playerState") {
      const room = rooms.get(msg.roomId ?? meta.roomId ?? "");
      if (!room || !msg.playerId || !room.players.has(msg.playerId)) return;
      const player = room.players.get(msg.playerId)!;
      room.players.set(msg.playerId, {
        ...player,
        scene: msg.scene ?? player.scene,
        x: msg.x ?? player.x,
        y: msg.y ?? player.y,
        character: msg.character ?? player.character,
        direction: msg.direction ?? player.direction,
        moving: msg.moving ?? player.moving,
        hasPeru: msg.hasPeru ?? player.hasPeru,
        guildId: msg.guildId ?? player.guildId,
        updatedAt: Date.now(),
      });
      broadcastRoom(room);
      return;
    }

    if (msg.type === "input") {
      const room = rooms.get(msg.roomId ?? meta.roomId ?? "");
      if (!room) return;

      // Anti-cheat básico: rate limit de inputs por socket.
      const now = Date.now();
      const metaAny = meta as { inputTimes?: number[] };
      if (!metaAny.inputTimes) metaAny.inputTimes = [];
      metaAny.inputTimes = metaAny.inputTimes.filter((t) => now - t < 1000);
      if (metaAny.inputTimes.length > 60) {
        ws.send(JSON.stringify({ type: "error", message: "rate limit excedido" }));
        return;
      }
      metaAny.inputTimes.push(now);

      const code = String(msg.code ?? "");
      const key = String(msg.key ?? "");
      if (!code || code.length > 20 || key.length > 20) {
        ws.send(JSON.stringify({ type: "error", message: "input inválido" }));
        return;
      }
      const payload = JSON.stringify({
        type: "input",
        roomId: room.id,
        playerId: msg.playerId ?? meta.playerId,
        action: msg.action,
        code: msg.code,
        key: msg.key,
      });
      for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) continue;
        const m = socketMeta.get(client);
        if (m?.roomId === room.id) client.send(payload);
      }
      return;
    }

    if (
      msg.type === "battleStart" ||
      msg.type === "battleSnapshot" ||
      msg.type === "battlePlayerState" ||
      msg.type === "battleNpcDamage" ||
      msg.type === "battleNpcHit" ||
      msg.type === "battleEnd" ||
      msg.type === "battleRetry" ||
      msg.type === "battleLeave" ||
      msg.type === "requestSync" ||
      msg.type === "opponentDamage"
    ) {
      const room = rooms.get(msg.roomId ?? meta.roomId ?? "");
      if (!room) return;
      // Repassa o payload inteiro: o cliente decide o que é campo de sincronia
      // (state/direction/phase/projectiles/hit). Listar campos aqui já custou
      // bug de avatar remoto congelado em "down" e de hit de NPC sumindo.
      relayRoom(room.id, {
        ...msg,
        type: msg.type,
        roomId: room.id,
        from: meta.playerId,
      });
      return;
    }

    if (
      msg.type === "guildInvite" ||
      msg.type === "guildResponse" ||
      msg.type === "pvpInvite" ||
      msg.type === "pvpResponse"
    ) {
      const room = rooms.get(msg.roomId ?? meta.roomId ?? "");
      if (!room) return;
      const payload = JSON.stringify({
        type: msg.type,
        roomId: room.id,
        to: msg.to,
        from: msg.from,
        fromName: msg.fromName,
        accept: msg.accept,
        amount: msg.amount,
      });
      for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) continue;
        const m = socketMeta.get(client);
        if (m?.roomId === room.id) client.send(payload);
      }
      return;
    }

    if (msg.type === "play") {
      const room = rooms.get(msg.roomId ?? meta.roomId ?? "");
      if (!room) return;
      const route = (msg.route as string) || "/jomasioentrance/one";
      const payload = JSON.stringify({ type: "play", roomId: room.id, route });
      for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) continue;
        const m = socketMeta.get(client);
        if (m?.roomId === room.id) client.send(payload);
      }
      return;
    }

    if (msg.type === "ping") {
      ws.send(JSON.stringify({ type: "pong", t: msg.t }));
    }
  });

  ws.on("close", () => {
    const meta = socketMeta.get(ws);
    if (meta?.roomId && meta.playerId) {
      const room = rooms.get(meta.roomId);
      if (room && !hasOtherSocket(meta.roomId, meta.playerId, ws)) {
        room.players.delete(meta.playerId);
        if (room.players.size === 0) rooms.delete(room.id);
        else broadcastRoom(room);
      }
    }
    socketMeta.delete(ws);
  });
});

// heartbeat
const heartbeat = setInterval(() => {
  for (const ws of wss.clients) {
    if (ws.readyState === WebSocket.OPEN) ws.ping();
  }
}, 30000);
wss.on("close", () => clearInterval(heartbeat));

server.listen(PORT, "0.0.0.0", () => {
  console.log(`⚔️  Jomasio server running on http://0.0.0.0:${PORT}`);
});