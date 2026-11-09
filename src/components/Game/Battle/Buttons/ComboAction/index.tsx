import { usePlayer } from "@/contexts/PlayerContext";
import { useGameControls } from "@/contexts/GameControlsContext";
import { useSettings } from "@/hooks/settings/useSetting";
import { resolveBattleSprite } from "@/utils/paths";
import { getComboAction } from "@/data/battle/comboActions";
import styles from "./styles.module.css";

export function ComboAction() {
  const { player } = usePlayer();
  const { activeControls } = useGameControls();
  const { showComboAction } = useSettings();

  const combo = getComboAction(player.state);
  if (!combo || !showComboAction) return null;

  const src = resolveBattleSprite(player.character, combo.sprite);

  function handleDown() {
    activeControls?.onConfirm?.();
  }

  return (
    <div className={styles.container}>
      <button className={styles.button} onPointerDown={handleDown}>
        <img loading="lazy" decoding="async" src={src} alt={combo.label} draggable={false} />
      </button>
    </div>
  );
}
