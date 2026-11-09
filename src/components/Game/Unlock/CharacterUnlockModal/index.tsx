import { useEffect, useState } from "react";
import { useCharacterUnlock } from "@/contexts/CharacterUnlockContext";
import { useGameControlsLayer } from "@/hooks/game/useGameControlsLayer";
import { playerPath } from "@/utils/paths";
import { getCharacterName } from "@/data/options/characters";

import styles from "./styles.module.css";

export function CharacterUnlockModal() {
  const { current, dismiss } = useCharacterUnlock();

  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [current]);

  // Enquanto o modal está aberto, consome toda a entrada do jogo: só fecha
  // com "Continuar" ou onConfirm.
  useGameControlsLayer(
    current
      ? {
          onUp: () => true,
          onDown: () => true,
          onLeft: () => true,
          onRight: () => true,
          onCancel: () => true,
          onConfirm: () => {
            dismiss();
            return true;
          },
          onUpRelease: () => {},
          onDownRelease: () => {},
          onLeftRelease: () => {},
          onRightRelease: () => {},
          onCancelRelease: () => {},
          onConfirmRelease: () => {},
          blockGlobalOpen: true,
        }
      : null,
    [current, dismiss],
  );

  if (!current) return null;

  const characterName = getCharacterName(current);

  return (
    <div className="overlay">
      <div className={`modal ${styles.modal}`}>
        {!imageFailed && (
          <img loading="lazy" decoding="async"
            className={styles.image}
            src={playerPath(`/${current}/unlockment.svg`)}
            alt={characterName}
            onError={() => setImageFailed(true)}
          />
        )}

        <button className={styles.button} onClick={dismiss}>
          Continuar
        </button>
      </div>
    </div>
  );
}
