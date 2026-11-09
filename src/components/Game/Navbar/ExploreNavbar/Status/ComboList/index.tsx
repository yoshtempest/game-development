import { resolveBattleSprite, playerPath } from "@/utils/paths";
import { getComboMoves } from "@/data/battle/comboMoves";
import styles from "./styles.module.css";

export function ComboList({
  characterId,
  startIndex = 0,
}: {
  characterId: CharacterId;
  startIndex?: number;
}) {
  const combos = getComboMoves(characterId);

  return (
    <div className={styles.section}>
      <div className={styles.flexRow}>
        <img loading="lazy" decoding="async"
          src={playerPath(`/${characterId}/face.svg`)}
          className={styles.faceImage}
        />
        <p className="StatusTitle">Combos</p>
      </div>

      {combos.map((combo, i) => (
        <div
          key={combo.id}
          className={styles.comboCard}
          data-index={startIndex + i}
        >
          <div className={styles.comboHeader}>
            <span className={styles.comboName}>{combo.name}</span>
            <div className={styles.sequence}>
              {combo.sequence.map((btn, i) => (
                <span key={i} className={styles.button}>
                  {btn}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.sprites}>
            {combo.states.map((state) => (
              <img loading="lazy" decoding="async"
                key={state}
                src={resolveBattleSprite(characterId, state)}
                alt={state}
                className={styles.sprite}
              />
            ))}
          </div>

          <p className={styles.description}>{combo.description}</p>
          <p className={styles.situation}>{combo.situation}</p>
        </div>
      ))}
    </div>
  );
}
