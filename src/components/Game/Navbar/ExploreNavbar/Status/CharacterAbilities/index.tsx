import { useRef, useState } from "react";
import { Zap, ShieldCheck } from "lucide-react";

import { useCharacterProgress } from "@/contexts/CharacterProgressContext";

import { getCharacterAbilities } from "@/data/characters/abilities";
import { getAbilityUnlockLevel } from "@/gameRules/player/abilityUnlock";
import { PassiveSkills } from "@/components/Game/Battle/PassiveSkills";
import {
  getBabidiAttackMode,
  setBabidiAttackMode,
  type BabidiAttackMode,
} from "@/utils/character/babidiAttackMode";

import styles from "./styles.module.css";
import { BabidiAttackCard, BABIDI_ATTACK_OPTIONS } from "./BabidiAttackCard";
import { AbilityMeta } from "./AbilitieMeta";
import { useAutoScrollSelectedItem } from "./useAutoScrollSelectedItem";

/**
 * Habilidades do personagem em exibição no Status.
 *
 * A lista é puramente apresentacional: quem dona a layer de input é o Status
 * (pontos de stat), então as setas não podem mover dois cursores ao mesmo
 * tempo. A seleção aqui acontece por clique.
 */
export function CharacterAbilities({ characterId }: { characterId: CharacterId }) {
  const { progress } = useCharacterProgress();
  const level = progress[characterId]?.level ?? 1;

  const isBabidi = characterId === "babidi";

  const [babidiMode, setBabidiMode] = useState<BabidiAttackMode>(() =>
    isBabidi ? getBabidiAttackMode() : "withGun",
  );

  const abilities = getCharacterAbilities(characterId);

  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useAutoScrollSelectedItem({
    containerRef,
    selectedIndex,
  });

  return (
    <div className="StatusColumn">
      <div className="statusMainContainer">
        <div className="statusHeader">
          <Zap size={18} />
          <h2 className="StatusTitle">Habilidades</h2>
        </div>
      </div>
      <div ref={containerRef} className={styles.container}>
        {abilities.length === 0 && (
          <p className={styles.empty}>
            Este personagem ainda não tem habilidades definidas.
          </p>
        )}
        {isBabidi && (
          <>
            <div className={styles.modeGrid}>
              {BABIDI_ATTACK_OPTIONS.map((mode) => (
                <BabidiAttackCard
                  key={mode.id}
                  mode={mode}
                  selected={babidiMode === mode.id}
                  onSelect={() => {
                    setBabidiMode(mode.id);
                    setBabidiAttackMode(mode.id);
                  }}
                />
              ))}
            </div>
          </>
        )}

        {abilities.map((ability, i) => {
          const active = ability.kind === "active";
          const unlockLevel = active
            ? getAbilityUnlockLevel(characterId, ability.id)
            : ability.unlockedAtLevel;
          const locked = level < unlockLevel;
          const Icon = active ? Zap : ShieldCheck;

          return (
            <div
              key={ability.id}
              data-index={i}
              className={`${styles.card} ${i === selectedIndex ? styles.selected : ""}`}
              style={locked ? { opacity: 0.5 } : undefined}
              onClick={() => setSelectedIndex(i)}
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
                <AbilityMeta
                  ability={ability}
                  characterId={characterId}
                  unlockLevel={unlockLevel}
                  locked={locked}
                />
              </div>
            </div>
          );
        })}
        <PassiveSkills characterId={characterId} startIndex={0} />
      </div>
    </div>
  );
}
