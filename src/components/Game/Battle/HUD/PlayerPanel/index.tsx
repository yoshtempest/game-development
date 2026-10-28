import { HealthBar } from "@/components/Game/Battle/HUD/HealthBar";
import { Deliciometro } from "@/components/Game/Battle/HUD/Deliciometro";
import { BlockGauge } from "@/components/Game/Battle/HUD/BlockGauge";
import { EnergyBar } from "@/components/Game/Battle/HUD/EnergyBar";
import { ElementBadges } from "@/components/Game/Battle/HUD/ElementBadges";
import { playerPath } from "@/utils/paths";
import type { ElementType } from "@/utils/types/battle/element";
import styles from "@/components/Game/Battle/HUD/styles.module.css";
import { getEnergyName, hasManaBar } from "@/gameRules/battle/mana";
// import { characterFaceStyle } from "@/utils/character/elementFace";
// import type { CharacterOption } from "@/utils/types/player/character";

type Props = {
  // characterColor: CharacterOption & { unlockedDate?: string | null };
  character: CharacterId;
  /** Forma especial ativa (Forma Vastolord do marshadow): troca a face para a da forma. */
  playerForm?: "vastolordForm";
  playerName: string;
  playerRank: string;
  playerLevel: number;
  playerElementTypes?: readonly ElementType[];
  hp: number;
  maxHp: number;
  shield: number;
  delicia: number;
  hitsToSpecial: number;
  blockGauge: number;
  blockLimit: number;
  energy?: number;
  mana?: number;
  maxMana?: number;
};

export function PlayerHUDPanel({
  // characterColor,
  character,
  playerForm,
  playerName,
  playerLevel,
  playerElementTypes,
  hp,
  maxHp,
  shield,
  delicia,
  hitsToSpecial,
  blockGauge,
  blockLimit,
  energy,
  mana,
  maxMana,
}: Props) {
  return (
    <div className={styles.container} style={{ left: 10, top: 10 }}>
      <div>
        <img
          src={
            playerForm === "vastolordForm"
              ? playerPath(`/${character}/inFight/vastolordForm/face.svg`)
              : playerPath(`/${character}/face.svg`)
          }
          alt="Player HUD"
          className="hudImage"
          // style={characterFaceStyle(characterColor.image)}
        />
        <BlockGauge blockGauge={blockGauge} blockLimit={blockLimit} />
      </div>
      <div className={styles.playerInfo}>
        <div className={styles.nameRow}>
          <h2 className={`${"hudName"} ${styles.playerName}`}>
            {playerName} - Nv.{playerLevel}
          </h2>
          {playerElementTypes && <ElementBadges types={playerElementTypes} />}
        </div>

        <div className="hudFlexRow">
          <div>
            <HealthBar hp={hp} maxHp={maxHp} />
            {shield > 0 && (
              <div className="shieldTrack">
                <div
                  className="shieldFill"
                  style={{
                    width: `${Math.min(100, (shield / maxHp) * 100)}%`,
                  }}
                />
              </div>
            )}

            {energy != null && <EnergyBar label="REIRYOKU" value={energy} />}
            {hasManaBar(character) && mana != null && maxMana != null && (
              <EnergyBar
                // O rótulo sai da mesma fonte que o menu de Status
                // (`getEnergyName`): nada de tabela paralela aqui.
                label={getEnergyName(character).toUpperCase()}
                value={mana}
                max={maxMana}
                tone={character === "natsuki" ? "cursed" : "mana"}
              />
            )}
            <Deliciometro delicia={delicia} hitsToSpecial={hitsToSpecial} />
          </div>
        </div>
      </div>
    </div>
  );
}
