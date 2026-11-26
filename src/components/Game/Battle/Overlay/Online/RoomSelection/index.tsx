
import { RefreshCw, Plus, LogIn, Users } from "lucide-react";
import { useOnline } from "@/contexts/OnlineContext";
import styles from "./styles.module.css";

type OnlineContext = ReturnType<typeof useOnline>;
type RoomSummary = OnlineContext["rooms"][number];

interface RoomSelectionProps {
  rooms: RoomSummary[];
  name: string;
  code: string;
  codeError: string | null;
  onNameChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onCreate: () => void | Promise<void>;
  onJoin: (id: string) => void | Promise<void>;
  onJoinByCode: () => void | Promise<void>;
  onRefresh: () => void;
}

export function RoomSelection({
  rooms,
  name,
  code,
  codeError,
  onNameChange,
  onCodeChange,
  onCreate,
  onJoin,
  onJoinByCode,
  onRefresh,
}: RoomSelectionProps) {
  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <h2>Criar uma sala</h2>

        <div className={styles.inputGroup}>
          <input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Nome da sala"
            maxLength={30}
          />

          <button
            type="button"
            onClick={() => void onCreate()}
            disabled={!name.trim()}
          >
            <Plus size={18} />
            Criar sala
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Entrar em uma sala</h2>

        <div className={styles.inputGroup}>
          <input
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            placeholder="Código da sala"
          />

          <button
            type="button"
            onClick={() => void onJoinByCode()}
            disabled={!code.trim()}
          >
            <LogIn size={18} />
            Entrar
          </button>
        </div>

        {codeError && (
          <p className={styles.error} role="alert">
            {codeError}
          </p>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Salas disponíveis</h2>

          <button
            type="button"
            onClick={onRefresh}
            aria-label="Atualizar salas"
            title="Atualizar salas"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {rooms.length === 0 ? (
          <div className={styles.empty}>
            <Users size={32} />
            <p>Nenhuma sala encontrada.</p>
            <span>Crie uma sala ou tente novamente mais tarde.</span>
          </div>
        ) : (
          <ul className={styles.roomList}>
            {rooms.map((room) => (
              <li key={room.id} className={styles.roomItem}>
                <div className={styles.roomInfo}>
                  <strong>{room.name}</strong>

                  <span>
                    {room.players.length} jogador(es)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => void onJoin(room.id)}
                >
                  Entrar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
