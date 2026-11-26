
import { LogOut, Play, Users } from "lucide-react";
import { RoomShareInfo } from "@/components/Game/Online/RoomShareInfo";
import { useOnline } from "@/contexts/OnlineContext";
import styles from "./styles.module.css";

type OnlineContext = ReturnType<typeof useOnline>;
type Room = NonNullable<OnlineContext["room"]>;

interface RoomLobbyProps {
  room: Room;
  roomId: OnlineContext["roomId"];
  playerId: OnlineContext["playerId"];
  isHost: boolean;
  onPlay: () => void;
  onLeave: () => void;
}

export function RoomLobby({
  room,
  roomId,
  playerId,
  isHost,
  onPlay,
  onLeave,
}: RoomLobbyProps) {
  return (
    <div className={styles.container}>
      <section className={styles.roomHeader}>
        <div>
          <span className={styles.subtitle}>Você está conectado à sala</span>
          <h2>{room.name}</h2>
        </div>

        <div className={styles.status}>
          <span />
          Conectado
        </div>
      </section>

      {isHost && roomId && (
        <RoomShareInfo roomId={roomId} />
      )}

      <section className={styles.playersSection}>
        <div className={styles.sectionHeader}>
          <h3>Jogadores</h3>

          <span>
            <Users size={15} />
            {room.players.length}
          </span>
        </div>

        <ul className={styles.playerList}>
          {room.players.map((player) => {
            const isCurrentPlayer = player.id === playerId;

            return (
              <li key={player.id} className={styles.player}>
                <div className={styles.avatar}>
                  <Users size={18} />
                </div>

                <div className={styles.playerInfo}>
                  <strong>{player.name}</strong>

                  <span>
                    {player.id === room.hostId
                      ? "Anfitrião"
                      : "Jogador"}
                  </span>
                </div>

                {isCurrentPlayer && (
                  <span className={styles.you}>Você</span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <div className={styles.actions}>
        {isHost && (
          <button
            type="button"
            className={styles.playButton}
            onClick={onPlay}
          >
            <Play size={18} fill="currentColor" />
            Jogar
          </button>
        )}

        <button
          type="button"
          className={styles.leaveButton}
          onClick={onLeave}
        >
          <LogOut size={18} />
          Sair da sala
        </button>
      </div>
    </div>
  );
}
