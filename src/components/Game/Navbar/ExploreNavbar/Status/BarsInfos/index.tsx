import { usePlayer } from "@/contexts/PlayerContext";
import { useCharacterProgress } from "@/contexts/CharacterProgressContext";
import { MAX_HUNGER, getHungerMultiplier } from "@/data/player/hunger";
import { MAX_SLEEP } from "@/data/player/sleep";
import { useTitles } from "@/contexts/TitleContext";
import { getRankMultiplier } from "@/gameRules/rank";
import { getEquipmentStatsBonus } from "@/gameRules/battle/equipment";
import { getMaxMana, getEnergyName, hasManaBar } from "@/gameRules/battle/mana";
import { ProgressBar } from "@/components/Game/ProgressBar";
import styles from "./styles.module.css";
import { Drumstick, Heart, Moon, Sparkles } from "lucide-react";
import { statusIconPath } from "@/utils/paths";

export function BarsInfos() {
  const { player } = usePlayer();
  const character = player.character;
  const { progress, getXPToNextLevel } = useCharacterProgress();
  const { getBonus } = useTitles();

  const charProgress = progress[player.character];
  const xpNeeded = getXPToNextLevel(charProgress.level);

  const equipmentBonus = getEquipmentStatsBonus(character);
  const titleBonus = getBonus();
  const rankMultiplier = getRankMultiplier(charProgress.level);
  const hungerMultiplier = getHungerMultiplier(charProgress.hunger);
  const allStatsPct = 1 + titleBonus.percentAllStats / 100;
  // Vida deriva da Resistência: o stat `hp` saiu do menu de pontos.
  const effectiveHp =
    (charProgress.stats.resistance + equipmentBonus.hp + titleBonus.hp) *
    allStatsPct;
  const playerMaxHp =
    90 + Math.round(effectiveHp * rankMultiplier * hungerMultiplier) * 10;
  const currentHP = charProgress.battleHP ?? playerMaxHp;
  const maxMana = getMaxMana(
    character,
    charProgress.stats.spirit + equipmentBonus.spirit + titleBonus.spirit,
  );
  const currentMana = charProgress.battleMana ?? maxMana;

  return (
    <div className={styles.container}>
      <div className={styles.statusContainer}>
        <div className={styles.statusHeader}>
          <div className={styles.statusName}>
            <img
              src={statusIconPath("xp.svg")}
              alt="XP"
              className={styles.statusIcon}
            />
            <span>XP</span>
          </div>
          <span className={styles.statusValue}>
            <strong>{charProgress.xp}</strong>
            <span> / {xpNeeded}</span>
          </span>
        </div>
        <ProgressBar
          value={charProgress.xp}
          max={xpNeeded}
          animationId={`char-xp-${player.character}`}
          level={charProgress.level}
        />
      </div>
      <div className={styles.statusContainer}>
        <div className={styles.statusHeader}>
          <div className={styles.statusName}>
            <Heart />
            <span>HP</span>
          </div>
          <span className={styles.statusValue}>
            <strong>{currentHP}</strong>
            <span> / {playerMaxHp}</span>
          </span>
        </div>
        <ProgressBar
          value={currentHP}
          max={playerMaxHp}
          animationId={`char-hp-${player.character}`}
          color={
            currentHP > playerMaxHp * 0.5
              ? "var(--success)"
              : currentHP > playerMaxHp * 0.2
                ? "orange"
                : "red"
          }
        />
      </div>
      {hasManaBar(character) && (
        <div className={styles.statusContainer}>
          <div className={styles.statusHeader}>
            <div className={styles.statusName}>
              <Sparkles />
              <span>{getEnergyName(character)}</span>
            </div>
            <span className={styles.statusValue}>
              <strong>{currentMana}</strong>
              <span> / {maxMana}</span>
            </span>
          </div>
          <ProgressBar
            value={currentMana}
            max={maxMana}
            animationId={`char-mana-${player.character}`}
            color={character === "natsuki" ? "#e84118" : "#7fc7ff"}
          />
        </div>
      )}
      <div className={styles.statusContainer}>
        <div className={styles.statusHeader}>
          <div className={styles.statusName}>
            <Drumstick />
            <span>Fome</span>
          </div>
          <span className={styles.statusValue}>
            <strong>{charProgress.hunger}</strong>
            <span> / {MAX_HUNGER}</span>
          </span>
        </div>
        <ProgressBar
          value={charProgress.hunger}
          max={MAX_HUNGER}
          animationId={`char-hunger-${player.character}`}
          color={
            charProgress.hunger > 50
              ? "var(--success)"
              : charProgress.hunger > 20
                ? "orange"
                : "red"
          }
        />
      </div>
      <div className={styles.statusContainer}>
        <div className={styles.statusHeader}>
          <div className={styles.statusName}>
            <Moon />
            <span>Sono</span>
          </div>
          <span className={styles.statusValue}>
            <strong>{charProgress.sleep}</strong>
            <span> / {MAX_SLEEP}</span>
          </span>
        </div>
        <ProgressBar
          value={charProgress.sleep}
          max={MAX_SLEEP}
          animationId={`char-sleep-${player.character}`}
          color={
            charProgress.sleep > 50
              ? "var(--success)"
              : charProgress.sleep > 20
                ? "orange"
                : "red"
          }
        />
      </div>
    </div>
  );
}
