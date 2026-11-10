import express from "express";
import cors from "cors";
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
  res.json({ ok: true });
});

app.post("/api/online/rooms/:id/state", (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) {
    res.status(404).json({ error: "sala não encontrada" });
    return;
  }
  const { playerId, scene, x, y, character } = req.body ?? {};
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
    updatedAt: Date.now(),
  });
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

app.listen(PORT, () => {
  console.log(`⚔️  Jomasio server running on http://localhost:${PORT}`);
});