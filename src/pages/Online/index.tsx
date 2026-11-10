import { useState } from "react";
import { useOnline } from "@/contexts/OnlineContext";

export default function Online() {
  const online = useOnline();
  const { rooms, connected, room, createRoom, joinRoom, leaveRoom, refreshRooms } =
    online;
  const [name, setName] = useState("");

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
            <button
              type="button"
              onClick={() => name.trim() && createRoom(name.trim())}
            >
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
                <button type="button" onClick={() => joinRoom(r.id)}>
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
                {p.name} {p.id === online.playerId ? "(você)" : ""}
              </li>
            ))}
          </ul>
          <button type="button" onClick={leaveRoom}>
            Sair da sala
          </button>
        </>
      )}
    </div>
  );
}