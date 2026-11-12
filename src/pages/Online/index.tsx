import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useOnline } from "@/contexts/OnlineContext";
import { useBattleSocket } from "@/hooks/useBattleSocket";
import { RoomShareInfo } from "@/components/Game/Online/RoomShareInfo";

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
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  const isHost = online.room?.hostId === online.playerId;

  // Guest: acompanha comando "play" do host
  useEffect(() => {
    if (isHost) return;
    if (lastMessage?.type !== "play") return;
    const route = (lastMessage.route as string) || "/jomasioentrance/one";
    void navigate(route);
  }, [isHost, lastMessage, navigate]);

  /**
   * Criar a sala mantém o dono nesta tela: é aqui que ele vê o código e o IP
   * para passar aos amigos (#539) e decide quando todos vão jogar ("Jogar").
   */
  const handleCreate = async () => {
    if (!name.trim()) return;
    await createRoom(name.trim());
  };

  const handleJoin = async (id: string) => {
    const r = await joinRoom(id);
    if (r) void navigate("/jomasioentrance/one");
  };

  const handleJoinByCode = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setCodeError(null);
    const r = await joinRoom(trimmed);
    if (r) void navigate("/jomasioentrance/one");
    else setCodeError("Sala não encontrada.");
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
          <div style={{ marginBottom: 16 }}>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Código da sala"
              style={{ marginRight: 8 }}
            />
            <button type="button" onClick={() => void handleJoinByCode()}>
              Entrar pelo código
            </button>
            {codeError && <p role="alert">{codeError}</p>}
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
          {isHost && online.roomId && <RoomShareInfo roomId={online.roomId} />}
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
