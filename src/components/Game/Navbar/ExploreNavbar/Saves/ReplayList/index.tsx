import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { loadReplays, deleteReplay } from "@/data/replays";
import { getNpcDisplayName } from "@/data/npc";
import { formatDuration } from "@/utils/formatDuration";
import type { ReplayData } from "@/utils/types/replay";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useGameControlsLayer } from "@/hooks/game/useGameControlsLayer";
import { useMenuSFX } from "@/hooks/menu/useMenuSFX";
import { CHARACTERS } from "@/data/options/characters";
import { playerPath, npcPath } from "@/utils/paths";
import styles from "./styles.module.css";

const CHARACTER_NAME_MAP = Object.fromEntries(
  CHARACTERS.map((c) => [c.image, c.name]),
);

function getPlayerDisplayName(characterId: string): string {
  return CHARACTER_NAME_MAP[characterId] ?? characterId;
}

type Props = {
  isOnTab: boolean;
};

export function ReplayList({ isOnTab }: Props) {
  const navigate = useNavigate();
  const [replays, setReplays] = useState<ReplayData[]>(() => loadReplays());
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { playMove, playSelect } = useMenuSFX();

  useEffect(() => {
    setReplays(loadReplays());
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.children[selectedIndex] as HTMLElement;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedIndex]);

  const selectedIndexRef = useLatestRef(selectedIndex);
  const replaysRef = useLatestRef(replays);
  const confirmDeleteRef = useLatestRef(confirmDelete);
  const isOnTabRef = useLatestRef(isOnTab);
  const playMoveRef = useLatestRef(playMove);
  const playSelectRef = useLatestRef(playSelect);
  const navigateRef = useLatestRef(navigate);

  const watchReplay = useCallback(
    (id: string) => {
      sessionStorage.setItem("replayTarget", id);
      void navigateRef.current("/");
    },
    [navigateRef],
  );

  useGameControlsLayer(
    {
      onUp: () => {
        if (isOnTabRef.current || confirmDeleteRef.current) return;
        if (replaysRef.current.length === 0) return;

        if (selectedIndexRef.current === 0) {
          return;
        }

        playMoveRef.current();
        setSelectedIndex((prev) => prev - 1);
      },
      onDown: () => {
        if (isOnTabRef.current || confirmDeleteRef.current) return;
        if (replaysRef.current.length === 0) return;

        playMoveRef.current();
        setSelectedIndex((prev) => (prev + 1) % replaysRef.current.length);
      },
      onConfirm: () => {
        if (isOnTabRef.current || confirmDeleteRef.current) return;

        const r = replaysRef.current[selectedIndexRef.current];
        if (!r) return;

        playSelectRef.current();
        watchReplay(r.id);
      },
      onCancel: () => {
        if (confirmDeleteRef.current) {
          setConfirmDelete(null);
          return true;
        }
        return false;
      },
      blockGlobalOpen: true,
    },
    [isOnTab, watchReplay],
  );

  if (replays.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Nenhum replay salvo.</p>
        <p className={styles.hint}>Salve um replay após vencer uma batalha!</p>
      </div>
    );
  }

  if (confirmDelete) {
    return (
      <div className={styles.confirmBox}>
        <p>Excluir replay?</p>
        <div className={styles.confirmActions}>
          <button
            className={`${styles.confirmBtn} ${styles.confirmDanger}`}
            onClick={() => {
              deleteReplay(confirmDelete);
              setReplays(loadReplays());
              setConfirmDelete(null);
              setSelectedIndex(0);
            }}
          >
            Sim, excluir
          </button>
          <button
            className={styles.confirmBtn}
            onClick={() => {
              setConfirmDelete(null);
            }}
          >
            Não, voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div ref={listRef} className={styles.list}>
        {replays.map((r, i) => {
          const isSelected = i === selectedIndex;
          const date = new Date(r.date);
          const dateStr = date.toLocaleDateString("pt-BR");
          const timeStr = date.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <div
              key={r.id}
              className={`${styles.card} ${isSelected ? styles.selected : ""}`}
            >
              <div className={styles.cardSprites}>
                <img
                  loading="lazy"
                  decoding="async"
                  src={playerPath(`/${r.playerCharacter}/face.svg`)}
                  alt=""
                  className={styles.sprite}
                />
                <span className={styles.vsText}>VS</span>
                <img
                  loading="lazy"
                  decoding="async"
                  src={npcPath(`/${r.npcType}/face.svg`)}
                  alt=""
                  className={styles.sprite}
                />
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.cardTitle}>
                  {getPlayerDisplayName(r.playerCharacter)} - nv.
                  {r.playerLevel ?? r.npcLevel} VS{" "}
                  {getNpcDisplayName(r.npcType)} - nv.{r.npcLevel}
                </span>
                <span className={styles.cardMeta}>
                  {formatDuration(r.duration)}
                </span>
                <span className={styles.cardDate}>
                  {dateStr} {timeStr}
                </span>
              </div>
              {isSelected && (
                <div className={styles.cardActions}>
                  <button
                    className={styles.actionBtn}
                    onClick={() => {
                      sessionStorage.setItem("replayTarget", r.id);
                      void navigate("/");
                    }}
                  >
                    Assistir
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.actionDanger}`}
                    onClick={() => setConfirmDelete(r.id)}
                  >
                    Excluir
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
