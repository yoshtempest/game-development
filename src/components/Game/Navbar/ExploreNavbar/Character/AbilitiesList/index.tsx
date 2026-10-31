import { useEffect, useRef, useState } from "react";
import { Zap, ShieldCheck, Clock, Coins, Sparkles } from "lucide-react";

import { useCharacterProgress } from "@/contexts/CharacterProgressContext";

import { getCharacterAbilities } from "@/data/characters/abilities";
import { getEnergyName } from "@/gameRules/battle/mana";
import { useGameControlsLayer } from "@/hooks/game/useGameControlsLayer";
import type { CharacterAbility } from "@/utils/types/player/abilities";
import { PassiveSkills } from "@/components/Game/Battle/PassiveSkills";
import { usePlayer } from "@/contexts/PlayerContext";
import {
  getBabidiAttackMode,
  setBabidiAttackMode,
  type BabidiAttackMode,
} from "@/utils/character/babidiAttackMode";

import styles from "./styles.module.css";

function formatCooldown(cooldownMs: number) {
  return `${cooldownMs / 1000}s`;
}

function AbilityMeta({
  ability,
  characterId,
}: {
  ability: CharacterAbility;
  characterId: CharacterId;
}) {
  const energyName = getEnergyName(characterId);

  if (ability.kind === "active") {
    return (
      <>
        {ability.cost !== undefined && (
          <span className={styles.meta}>
            <Coins size={12} /> {ability.cost} de {energyName}
          </span>
        )}
        {ability.cooldownMs !== undefined && (
          <span className={styles.meta}>
            <Clock size={12} /> Cooldown {formatCooldown(ability.cooldownMs)}
          </span>
        )}
        {ability.requires && (
          <span className={styles.meta}>
            <Sparkles size={12} /> {ability.requires}
          </span>
        )}
      </>
    );
  }

  return (
    <>
      <span className={styles.meta}>Nv. {ability.unlockedAtLevel}</span>
      {ability.oncePerBattle && (
        <span className={styles.meta}>1x por batalha</span>
      )}
    </>
  );
}

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

  const abilities = getCharacterAbilities(characterId);
  const totalItems = abilities.length;

  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const isBabidi = characterId === "babidi";
  const [babidiMode, setBabidiMode] = useState<BabidiAttackMode>(() =>
    isBabidi ? getBabidiAttackMode() : "withGun",
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current.querySelector<HTMLElement>(
      `[data-index="${selectedIndex}"]`,
    );
    if (!el) return;

    const container = containerRef.current;
    const elTop = el.offsetTop;
    const elBottom = elTop + el.offsetHeight;
    const { scrollTop, clientHeight } = container;

    if (elTop < scrollTop) {
      container.scrollTop = elTop;
    } else if (elBottom > scrollTop + clientHeight) {
      container.scrollTop = elBottom - clientHeight;
    }
  }, [selectedIndex]);

  useGameControlsLayer(
    {
      onUp: () => setSelectedIndex((i) => Math.max(0, i - 1)),
      onDown: () => setSelectedIndex((i) => Math.min(totalItems - 1, i + 1)),
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
      {isBabidi && (
        <div className={styles.card} style={{ marginBottom: 8 }}>
          <div className={styles.header}>
            <Zap size={16} color="#fbbf24" />
            <span className={styles.name}>Modo de ataque básico</span>
            <span className={`${styles.badge} ${styles.badgeActive}`}>
              {babidiMode === "withGun" ? "With Gun" : "With Missile"}
            </span>
          </div>
          <p className={styles.description}>
            Use ←/→ para alternar entre With Gun e With Missile e confirme com a
            tecla de ação.
          </p>
          <div className={styles.metaRow}>
            <span className={styles.meta}>
              Atual: {babidiMode === "withGun" ? "With Gun" : "With Missile"}
            </span>
          </div>
        </div>
      )}

      <div ref={containerRef} className={styles.container}>
        {abilities.length === 0 && (
          <p className={styles.empty}>
            Este personagem ainda não tem habilidades definidas.
          </p>
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
        {/* <div className={styles.title}>
          <span className={styles.titleMain}>Gran Rey</span>
          <span className={styles.titleSub}>Cero</span>
        </div> */}
      </div>
    </div>
  );
}
