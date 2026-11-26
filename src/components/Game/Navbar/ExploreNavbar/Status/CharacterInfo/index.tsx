import { useCallback, useEffect, useRef, useState } from "react";
import { usePlayer, usePlayerActions } from "@/contexts/PlayerContext";
import { useCharacterProgress } from "@/contexts/CharacterProgressContext";
import { useEquipment } from "@/contexts/EquipmentContext";
import { CHARACTERS } from "@/data/options/characters";
import { CharacterElements } from "@/components/Game/Navbar/ExploreNavbar/Status/CharacterInfo/CharacterElements";
import { npcPath, playerPath } from "@/utils/paths";
import { getRank, formatRank } from "@/gameRules/rank";
import { HUNGRY_THRESHOLD } from "@/data/player/hunger";
import styles from "./styles.module.css";
import { BarsInfos } from "@/components/Game/Navbar/ExploreNavbar/Status/BarsInfos";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { useCharacterVoice } from "@/hooks/audio/useCharacterVoice";
import { useMenuSFX } from "@/hooks/menu/useMenuSFX";
import { useStableCallback } from "@/hooks/useStableCallback";

export function CharacterInfo({ characterId }: { characterId: CharacterId }) {
  const { player, playerClass } = usePlayer();
  const { setCharacter } = usePlayerActions();
  const { progress } = useCharacterProgress();
  const { getEquippedItem } = useEquipment();
  const { playSound } = useSoundEffects();
  const playVoice = useCharacterVoice();
  const { playSelect } = useMenuSFX();

  const charProgress = progress[characterId];
  const characterData = CHARACTERS.find((c) => c.image === characterId);
  const isInUse = player.character === characterId;

  const isHungry = charProgress.hunger <= HUNGRY_THRESHOLD;
  const [showImage, setShowImage] = useState(true);

  useEffect(() => {
    setShowImage(true);
  }, [isHungry]);

  const handleImageError = useCallback(() => {
    if (isHungry) {
      setShowImage(false);
    }
  }, [isHungry]);

  const handleSelect = useStableCallback(() => {
    if (isInUse) return;
    playSelect();
    setCharacter(characterId);
    playVoice(characterId);
  });

  // Flash na silhueta quando o jogador investe um ponto de status. O gasto é
  // observado pela queda de `stats.points` — `addStat` é o único lugar do jogo
  // que decrementa o contador (o level up só soma), então comparar com a
  // referência anterior distingue investir ponto de qualquer outra mudança de
  // progresso. O contador guarda junto o personagem a que pertence: trocar de
  // personagem troca os pontos sem que nenhum tenha sido gasto.
  const stats = charProgress.stats;
  const prevRef = useRef({ character: characterId, points: stats.points });
  const [flashKey, setFlashKey] = useState(0);

  useEffect(() => {
    const prev = prevRef.current;
    const spent = characterId === prev.character && stats.points < prev.points;

    // Reancora sempre — inclusive na troca de personagem, que só reconstrói a
    // referência sem disparar nada.
    prevRef.current = { character: characterId, points: stats.points };
    if (spent) {
      playSound("statusLevelUp");
      setFlashKey((key) => key + 1);
    } else if (characterId !== prev.character) {
      // O flash pendente do personagem anterior não pode sobrar no retrato novo.
      setFlashKey(0);
    }
  }, [characterId, stats, playSound]);

  const petItem = getEquippedItem(characterId, "pet");
  const petNpcType = petItem?.id.replace("pet_", "");

  return (
    <div className={`StatusColumn ${styles.characterInfo}`}>
      <div className={styles.imagesRow}>
        {showImage && (
          <img
            loading="lazy"
            decoding="async"
            // O `key` reancora o `<img>` a cada ponto investido: o remount
            // reinicia a animação de flash (o `src` é o mesmo e sai do cache).
            key={flashKey}
            src={playerPath(
              isHungry
                ? `/${characterId}/expressions/hungry.svg`
                : `/${characterId}/expressions/default.svg`,
            )}
            className={`${styles.characterImage}${
              flashKey > 0 ? ` ${styles.flash}` : ""
            }`}
            onError={handleImageError}
          />
        )}
        {petItem && petNpcType && (
          <img
            loading="lazy"
            decoding="async"
            src={npcPath(`/${petNpcType}/default.svg`)}
            className={styles.petImage}
          />
        )}
      </div>
      <div className={styles.characterOverlay}>
        <button
          type="button"
          className={`statusButton ${styles.selectButton}`}
          onClick={handleSelect}
          disabled={isInUse}
        >
          {isInUse ? "Em uso" : "Selecionar"}
        </button>
        <div className={styles.characterTitle}>
          <h2 className={styles.characterName}>{characterData?.name}</h2>
          <span className={styles.level}>Nv. {charProgress.level}</span>
        </div>
        <CharacterElements character={characterId} />
        <h2 className={styles.rank}>
          {formatRank(getRank(charProgress.level))}
        </h2>
        <div className={styles.class}>
          <span>Classe:</span>
          <strong>{playerClass}</strong>
        </div>
        <BarsInfos characterId={characterId} />
      </div>
    </div>
  );
}
