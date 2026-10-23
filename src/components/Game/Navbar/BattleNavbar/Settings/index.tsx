import styles from "./styles.module.css";
import { getNpcDisplayName } from "@/data/npc";
import { npcPath, playerPath } from "@/utils/paths";
import { ComboList } from "@/components/Game/Navbar/ExploreNavbar/Status/ComboList";
import { getCharacterElementTypes } from "@/data/types/characterElementTypes";
import { getNpcElementTypes } from "@/data/types/npcElementTypes";
import { BattleCard } from "./BattleCard";
import { ElementChart } from "@/components/Game/Navbar/shared/ElementChart";
import { defineDialogue } from "@/data/dialogues/defineDialogue";
import { soundEffectPath } from "@/utils/paths";

import { usePlayer } from "@/contexts/PlayerContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { useBattleInfo } from "@/contexts/BattleInfoContext";
import { useCharacterProgress } from "@/contexts/CharacterProgressContext";
import { useTitles } from "@/contexts/TitleContext";
import {
  getEquipmentStatsBonus,
  getTotalArmor,
  getTotalShield,
  getTotalUniversalVampirism,
  getTotalVampirism,
  getTotalReflect,
} from "@/gameRules/battle/equipment";
import { formatRank, getRank, getRankMultiplier } from "@/gameRules/rank";
import { buildCharacterStats } from "@/hooks/battle/buildCharacterStats";

import { CLASS_DATA } from "@/data/npc";
import { getCharacterStatus } from "@/data/player/stats";
import { combatService } from "@/services/combat";
import {
  addArmor,
  getBlockArmor,
  NO_ARMOR,
  scaleArmor,
} from "@/gameRules/battle/damage/armor";

import Talking from "@/components/Game/Interactions/Talking";
import { useCutscene } from "@/hooks/interaction/useCutscene";


export function Settings() {
  const battleInfoCtx = useBattleInfo();
  const { player } = usePlayer();
  const { progress } = useCharacterProgress();
  const { getBonus } = useTitles();

  const playerLevel = progress[player.character]?.level ?? 1;
  const playerRank = formatRank(getRank(playerLevel));
  const playerName = localStorage.getItem("playerName") || "Protagonista";

  const battleInfo = battleInfoCtx?.battleInfo;
  const npcRank = battleInfo
    ? formatRank(getRank(battleInfo.npcLevel))
    : playerRank;

  const playerElementTypes = useMemo(
    () => getCharacterElementTypes(player.character),
    [player.character],
  );

  /**
   * Números da tela.
   *
   * Reusa `buildCharacterStats` em vez de repetir a fórmula: antes esta tela
   * duplicava a conta de stats e já mostrava valores diferentes da batalha real
   * sempre que uma fonte de bônus era acrescentada.
   */
  const playerStats = useMemo(() => {
    const baseChar = progress[player.character];
    if (!baseChar) return null;

    const equipmentBonus = getEquipmentStatsBonus(player.character);
    const titleBonus = getBonus();
    const rankMultiplier = getRankMultiplier(baseChar.level);

    const char = buildCharacterStats(
      baseChar,
      equipmentBonus,
      titleBonus,
      rankMultiplier,
    ).stats;

    const { hp, strength, technique, spirit, resistance, tenacity, luck } =
      char;
    const luckBonus = combatService.getLuckBonus(luck);
    // A armadura do título entra nas DUAS colunas: `armor` legado é a base
    // física e mágica ao mesmo tempo.
    const armor = addArmor(
      getTotalArmor(player.character, baseChar.stats.resistance),
      scaleArmor(NO_ARMOR, titleBonus.armor),
    );
    const shield = getTotalShield(player.character) + titleBonus.shield;
    const vampirism = getTotalVampirism(player.character);
    const universalVampirism = getTotalUniversalVampirism(player.character);
    const reflect = getTotalReflect(player.character);
    const maxHp = 90 + hp * 10;
    const maxHpDamage = equipmentBonus.maxHpDamage ?? 0;
    const trueDamage = equipmentBonus.trueDamage ?? 0;
    const maxHpDamageBonus = combatService.calculateMaxHpBonus(
      maxHp,
      maxHpDamage,
    );

    return {
      maxHp,
      strength,
      technique,
      spirit,
      resistance,
      tenacity,
      armor,
      shield,
      vampirism,
      universalVampirism,
      reflect,
      luckBonus,
      maxHpDamageBonus,
      trueDamage,
    };
  }, [player.character, progress, getBonus]);

  const winProbability = useMemo(() => {
    if (!battleInfo || !playerStats || !battleInfo) return null;

    const npcTypes = getNpcElementTypes(battleInfo.npcType);

    const playerElementMultiplier = combatService.getElementMultiplier(
      playerElementTypes,
      npcTypes,
    );
    const npcElementMultiplier = combatService.getElementMultiplier(
      npcTypes,
      playerElementTypes,
    );

    const enemyTotal =
      // Uma coluna só: o comparativo de poder é um número, e a armadura entra
      // pela mais alta das duas (a mesma que o block usa).
      (battleInfo.npcHp +
        battleInfo.npcDamage +
        getBlockArmor(battleInfo.npcArmor)) *
      npcElementMultiplier;
    const playerTotal =
      (playerStats.maxHp +
        playerStats.strength +
        playerStats.technique +
        playerStats.spirit +
        playerStats.resistance +
        playerStats.tenacity +
        getBlockArmor(playerStats.armor) +
        playerStats.shield +
        playerStats.vampirism +
        playerStats.universalVampirism +
        playerStats.reflect +
        playerStats.maxHpDamageBonus +
        playerStats.trueDamage) *
      playerElementMultiplier;
    if (playerTotal + enemyTotal === 0) return 50;
    return Math.round((playerTotal / (playerTotal + enemyTotal)) * 100);
  }, [battleInfo, playerStats, playerElementTypes]);

  const [displayedWin, setDisplayedWin] = useState(0);
  const displayedWinRef = useRef(0);

  useEffect(() => {
    if (winProbability === null) return;

    const from = displayedWinRef.current;
    const to = winProbability;
    const duration = 2000;
    let segStart = 0;
    let rafId = 0;

    function tick(ts: number) {
      if (segStart === 0) segStart = ts;
      const elapsed = ts - segStart;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - t) * (1 - t) * (1 - t);
      const value = from + (to - from) * eased;
      displayedWinRef.current = value;
      setDisplayedWin(value);

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      }
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [winProbability, playerStats]);

  const classData = battleInfo ? CLASS_DATA[battleInfo.npcClass] : null;

  const playerSummary = playerStats
    ? getCharacterStatus({
        hp: playerStats.maxHp,
        strength: playerStats.strength,
        technique: playerStats.technique,
        spirit: playerStats.spirit,
        resistance: playerStats.resistance,
        tenacity: playerStats.tenacity,
        armor: playerStats.armor,
        shield: playerStats.shield,
        vampirism: playerStats.vampirism,
        universalVampirism: playerStats.universalVampirism,
        reflect: playerStats.reflect,
        maxHpDamageBonus: playerStats.maxHpDamageBonus,
        trueDamage: playerStats.trueDamage,
      })
    : null;

  // Diálogo dinâmico para o Riquelme com a chance de vitória atual
  const riquelmeDialogue = useMemo(() => {
    if (winProbability === null) return null;
    return defineDialogue([
      [
        "janelaSistema",
        `As chances são de ${Math.round(winProbability)}% e aí, você perderia?`,
      ],
      {
        who: "protagonista",
        message: "Nah i'd win.",
        expression: "victory",
        soundSrc: soundEffectPath("player/characters/riquelme/nah-id-win.mp3"),
      },
    ]);
  }, [winProbability]);

  const cutscene = useCutscene({
    dialogue: riquelmeDialogue ?? [],
    playOnce: false,
  });

  const dialogue = cutscene.dialogue;

  return (
    <div className="containerOfNavbar">
      <div className={`${styles.battleContainer} `}>
        {battleInfo && playerStats && classData && playerSummary && (
          <>
            <h2 className={styles.center}>Configurações de Batalha</h2>
            <div className={styles.battleEntities}>
              <BattleCard
                spriteSrc={playerPath(
                  `/${player.character}/expressions/default.svg`,
                )}
                name={playerName}
                level={playerLevel}
                rank={playerRank}
                stats={playerSummary}
              />
              <h2>VS</h2>
              <BattleCard
                spriteSrc={npcPath(`/${battleInfo.npcType}/right.svg`)}
                name={getNpcDisplayName(battleInfo.npcType)}
                subtitle={
                  <span className={styles.npcClassLabel}>
                    Classe:{" "}
                    <span style={{ color: classData.color }}>
                      {classData.label}
                    </span>
                  </span>
                }
                level={battleInfo.npcLevel}
                rank={npcRank}
                stats={[
                  { label: "HP", value: Math.round(battleInfo.npcHp) },
                  { label: "Dano", value: Math.round(battleInfo.npcDamage) },
                  {
                    label: "Armadura física",
                    value: Math.round(battleInfo.npcArmor.physical),
                  },
                  {
                    label: "Armadura mágica",
                    value: Math.round(battleInfo.npcArmor.magical),
                  },
                ]}
              />
            </div>

            <h2 className={styles.marginTop}>Chance de Vitória</h2>
            <div className={styles.probabilityBar}>
              <div
                className={styles.probabilityFill}
                style={{ width: `${displayedWin}%` }}
              />
              <span className={styles.probabilityText}>
                {Math.round(displayedWin)}%
              </span>
            </div>
            {dialogue && player.character === "riquelme" && (
              <Talking
                name={dialogue.name}
                message={dialogue.message}
                src={dialogue.src}
                soundSrc={dialogue.soundSrc}
                autoAdvanceOnSound={dialogue.autoAdvanceOnSound}
              />
            )}
            <ComboList characterId={player.character} />

            <ElementChart />
          </>
        )}
      </div>
    </div>
  );
}
