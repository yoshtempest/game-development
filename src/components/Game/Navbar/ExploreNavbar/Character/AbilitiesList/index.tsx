import { useRef, useState } from "react";
import { Zap, ShieldCheck } from "lucide-react";

import { useCharacterProgress } from "@/contexts/CharacterProgressContext";

import { getCharacterAbilities } from "@/data/characters/abilities";
import { useGameControlsLayer } from "@/hooks/game/useGameControlsLayer";
import { PassiveSkills } from "@/components/Game/Battle/PassiveSkills";
import { usePlayer } from "@/contexts/PlayerContext";
import {
  getBabidiAttackMode,
  setBabidiAttackMode,
  type BabidiAttackMode,
} from "@/utils/character/babidiAttackMode";

import styles from "./styles.module.css";
import { BabidiAttackCard, BABIDI_ATTACK_OPTIONS } from "./BabidiAttackCard";
import { AbilityMeta } from "./AbilitieMeta";
import { useAutoScrollSelectedItem } from "./useAutoScrollSelectedItem";


export function AbilitiesList({
  characterId,
  onClose,
}: {
  characterId: CharacterId;
  onClose: () => void;
}) {
  const { progress } = useCharacterProgress();
  const level = progress[characterId]?.level ?? 1;
  const { player } = usePlayer();

  const isBabidi = characterId === "babidi";

  const [babidiMode, setBabidiMode] = useState<BabidiAttackMode>(() =>
    isBabidi ? getBabidiAttackMode() : "withGun",
  );

  const abilities = getCharacterAbilities(characterId);
  const totalItems = abilities.length;

  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useAutoScrollSelectedItem({
    containerRef,
    selectedIndex,
  });

  useGameControlsLayer(
    {
      onUp: () => setSelectedIndex((i) => Math.max(0, i - 1)),
      onDown: () =>
        setSelectedIndex((i) => Math.min(totalItems - 1, i + 1)),
      ...(isBabidi
        ? {
            onLeft: () =>
              setBabidiMode((m) =>
                m === "withGun" ? "withMissile" : "withGun",
              ),
            onRight: () =>
              setBabidiMode((m) =>
                m === "withGun" ? "withMissile" : "withGun",
              ),
            onConfirm: () => setBabidiAttackMode(babidiMode),
          }
        : {}),
    },
    [totalItems, isBabidi, babidiMode],
  );

  return (
    <div className="containerOfNavbar" style={{ overflow: "hidden" }}>
      <div className={styles.viewHeader}>
        <h2>Habilidades</h2>
        <button className={styles.backButton} onClick={onClose}>
          Voltar
        </button>
      </div>
      <div ref={containerRef} className={styles.container}>
        {abilities.length === 0 && (
          <p className={styles.empty}>
            Este personagem ainda não tem habilidades definidas.
          </p>
        )}
        {isBabidi && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 8,
                marginBottom: 8,
              }}
            >
              {BABIDI_ATTACK_OPTIONS.map((mode) => (
                <BabidiAttackCard
                  key={mode.id}
                  mode={mode}
                  selected={babidiMode === mode.id}
                  onSelect={() => setBabidiMode(mode.id)}
                />
              ))}
            </div>

            <p className={styles.description}>
              Use ←/→ para selecionar seu modo de ataque e confirme com a tecla de ação.
            </p>
          </>
        )}

        {abilities.map((ability, i) => {
          const active = ability.kind === "active";
          const locked = !active && level < ability.unlockedAtLevel;
          const Icon = active ? Zap : ShieldCheck;

          return (
            <div
              key={ability.id}
              data-index={i}
              className={`${styles.card} ${i === selectedIndex ? styles.selected : ""}`}
              style={locked ? { opacity: 0.5 } : undefined}
            >
              <div className={styles.header}>
                <Icon size={16} color={active ? "#fbbf24" : "#4ade80"} />
                <span className={styles.name}>{ability.name}</span>
                <span
                  className={`${styles.badge} ${
                    active ? styles.badgeActive : styles.badgePassive
                  }`}
                >
                  {active ? "Ativa" : "Passiva"}
                </span>
              </div>

              <p className={styles.description}>{ability.description}</p>

              <div className={styles.metaRow}>
                <AbilityMeta ability={ability} characterId={characterId} />
              </div>
            </div>
          );
        })}
        <PassiveSkills characterId={player.character} startIndex={0} />
      </div>
    </div>
  );
}
