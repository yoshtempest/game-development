import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useOnline } from "@/contexts/OnlineContext";
import { useBattleSocket } from "@/hooks/useBattleSocket";

export default function Online() {
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
  const { send, lastMessage } = useBattleSocket(online.roomId, online.playerId);
  const [name, setName] = useState("");

  const isHost = online.room?.hostId === online.playerId;

  // Guest: acompanha comando "play" do host
  useEffect(() => {
    if (isHost) return;
    if (lastMessage?.type !== "play") return;
    const route = (lastMessage.route as string) || "/jomasioentrance/one";
    void navigate(route);
  }, [isHost, lastMessage, navigate]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    const r = await createRoom(name.trim());
    if (r) void navigate("/jomasioentrance/one");
  };

  const handleJoin = async (id: string) => {
    const r = await joinRoom(id);
    if (r) void navigate("/jomasioentrance/one");
  };

  const handlePlay = () => {
    send({ type: "play", route: "/jomasioentrance/one" });
    void navigate("/jomasioentrance/one");
  };

  return (
    <div style={{ padding: 24, color: "#fff" }}>
      <h1>Modo Online</h1>
      {!connected ? (
        <>
          <div style={{ marginBottom: 16 }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da sala"
              style={{ marginRight: 8 }}
            />
            <button type="button" onClick={handleCreate}>
              Criar sala
            </button>
            <button
              type="button"
              onClick={refreshRooms}
              style={{ marginLeft: 8 }}
            >
              Atualizar salas
            </button>
          </div>
          <h2>Salas disponíveis</h2>
          {rooms.length === 0 && <p>Nenhuma sala encontrada.</p>}
          <ul>
            {rooms.map((r) => (
              <li key={r.id} style={{ marginBottom: 8 }}>
                {r.name} ({r.players.length} jogador(es)){" "}
                <button type="button" onClick={() => handleJoin(r.id)}>
                  Entrar
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <p>
            Conectado à sala <strong>{room?.name}</strong>
          </p>
          <p>Jogadores:</p>
          <ul>
            {room?.players.map((p) => (
              <li key={p.id}>
                {p.name} {p.id === playerId ? "(você)" : ""}
              </li>
            ))}
          </ul>
          {isHost && (
            <button
              type="button"
              onClick={handlePlay}
              style={{ marginRight: 8 }}
            >
              Jogar
            </button>
          )}
          <button type="button" onClick={leaveRoom}>
            Sair da sala
          </button>
        </>
      )}
    </div>
  );
}
