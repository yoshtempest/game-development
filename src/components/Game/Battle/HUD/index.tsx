import { usePlayer } from "@/contexts/PlayerContext";
import { useCharacterProgress } from "@/contexts/CharacterProgressContext";
import { getRank, srcRank } from "@/gameRules/rank";
import { getCharacterElementTypes } from "@/data/types/characterElementTypes";
import { getNpcElementTypes } from "@/data/types/npcElementTypes";
// import { CHARACTERS } from "@/data/options/characters";
import { PlayerHUDPanel } from "./PlayerPanel";
import { NPCHUDPanel } from "./NpcPanel";
import { SummonHUDList } from "./SummonList";
import { AllyHUDList } from "./AllyList";
import type { BattleHudProps } from "./types";

export function BattleHUD({
  battle,
  npcStats,
  npcType,
  npcLevel,
  summons,
  allies,
  isAlfa = false,
  npcSpecialGauge,
  playerForm,
}: BattleHudProps) {
  const { player } = usePlayer();
  const { progress } = useCharacterProgress();
  const playerName = localStorage.getItem("playerName") || "Protagonista";

  // const characterColor = CHARACTERS.find((c) => c.image === player.character);
  const playerRank = `${srcRank(getRank(progress[player.character]?.level ?? 1))}`;
  const playerLevel = progress[player.character]?.level ?? 1;

  return (
    <>
      <PlayerHUDPanel
        // characterColor={characterColor!}
        character={player.character}
        playerForm={playerForm}
        playerName={playerName}
        playerRank={playerRank}
        playerLevel={playerLevel}
        playerElementTypes={getCharacterElementTypes(player.character)}
        hp={battle.playerHP}
        maxHp={battle.playerMaxHp}
        shield={battle.playerShield}
        delicia={battle.delicia}
        hitsToSpecial={battle.hitsToSpecial}
        blockGauge={battle.blockGauge}
        blockLimit={battle.blockLimit}
        energy={battle.energy}
        mana={battle.mana}
        maxMana={battle.manaMax}
      />

      {npcType && (
        <NPCHUDPanel
          npcType={npcType}
          npcLevel={npcLevel}
          npcHP={battle.npcHP}
          npcMaxHp={npcStats.hp}
          isAlfa={isAlfa}
          npcElementTypes={getNpcElementTypes(npcType)}
          blockGauge={npcType === "piupiu" ? battle.npcBlockGauge : undefined}
          blockLimit={npcType === "piupiu" ? battle.npcBlockLimit : undefined}
          specialGauge={npcSpecialGauge}
        />
      )}

      {summons && summons.length > 0 && (
        <SummonHUDList summons={summons} npcType={npcType} />
      )}

      {allies && allies.length > 0 && <AllyHUDList allies={allies} />}
    </>
  );
}
