
import { ArrowLeft } from "lucide-react";
import { useOnlineLobby } from "./useOnlineLobby";
import { RoomSelection } from "./RoomSelection";
import { RoomLobby } from "./RoomLobby";
import styles from "./styles.module.css";
import { useRef } from "react";

interface OnlineProps {
  onClose: () => void;
}

export default function OnlineOverlay({ onClose }: OnlineProps) {
  const lobby = useOnlineLobby();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="overlay">
      <div className={`modal ${styles.modal}`}>
        <header className={styles.flexRow}>
          <button type="button" onClick={onClose}>
            <ArrowLeft />
            Voltar
          </button>

          <h1>Multiplayer</h1>
        </header>
        <div ref={scrollRef} className={styles.scrollArea}>
          <p>Jogue com seus amigos em uma aventura compartilhada.</p>
          {lobby.room ? (
            <RoomLobby
              room={lobby.room}
              roomId={lobby.roomId}
              playerId={lobby.playerId}
              isHost={lobby.isHost}
              onPlay={lobby.play}
              onLeave={lobby.leaveRoom}
            />
          ) : (
            <RoomSelection
              rooms={lobby.rooms}
              name={lobby.name}
              code={lobby.code}
              codeError={lobby.codeError}
              onNameChange={lobby.setName}
              onCodeChange={lobby.setCode}
              onCreate={lobby.create}
              onJoin={lobby.join}
              onJoinByCode={lobby.joinByCode}
              onRefresh={lobby.refreshRooms}
            />
          )}
        </div>
      </div>
    </div>
  );
}
