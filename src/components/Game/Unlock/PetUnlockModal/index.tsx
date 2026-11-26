import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";

import { useEquipment } from "@/contexts/EquipmentContext";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";

import { useGameControlsLayer } from "@/hooks/game/useGameControlsLayer";

import { ROUTE_TO_BATTLE_KEY } from "@/data/battle/config";
import { PET_DROPS } from "@/data/characters/pets/petDrops";
import { getEquipmentById } from "@/data/equipment";

import { npcPath } from "@/utils/paths";
import {
  petFallbackImagePath,
  petNpcType,
} from "@/utils/character/petVisuals";

import styles from "./styles.module.css";

/**
 * Ordem de tentativa da imagem: a arte dedicada de unlock (mesma convenção do
 * `unlockment.svg` dos personagens) e, sem ela, o sprite padrão do pet — que
 * todo pet já tem — para o modal nunca abrir vazio enquanto a arte não chega.
 */
type ImageStage = "unlockment" | "fallback" | "none";

function getImageSrc(npcType: string, stage: ImageStage): string | null {
  if (stage === "unlockment") return npcPath(`/${npcType}/unlockment.svg`);
  if (stage === "fallback") return petFallbackImagePath(npcType);
  return null;
}

/**
 * Modal de "pet desbloqueado" (issue #480): flash + imagem + som, espelhando o
 * `CharacterUnlockModal`.
 *
 * A fila é local e alimentada pelo `newlyUnlockedPetIds` do
 * `EquipmentContext`, que só recebe o pet no **primeiro** drop. Ela não pode
 * ler a lista diretamente porque o menu de Pets limpa essa lista ao fechar
 * (badge de "novo"); o `seenRef` garante que cada pet anuncia uma vez por
 * sessão, mesmo que a lista volte a contê-lo.
 *
 * Durante a batalha o modal fica pendente: o drop sai na morte do NPC, e um
 * overlay que captura o input por cima da tela de vitória travaria o fluxo de
 * recompensas. Ele aparece assim que o jogador volta para a exploração.
 */
export function PetUnlockModal() {
  const { newlyUnlockedPetIds } = useEquipment();
  const { playSound } = useSoundEffects();
  const location = useLocation();

  const [queue, setQueue] = useState<string[]>([]);
  const [imageStage, setImageStage] = useState<ImageStage>("unlockment");
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const fresh = newlyUnlockedPetIds.filter((id) => !seenRef.current.has(id));
    if (fresh.length === 0) return;
    for (const id of fresh) seenRef.current.add(id);
    setQueue((prev) => [...prev, ...fresh]);
  }, [newlyUnlockedPetIds]);

  const inBattle = ROUTE_TO_BATTLE_KEY[location.pathname] !== undefined;
  const current = inBattle ? null : (queue[0] ?? null);

  useEffect(() => {
    if (!current) return;
    setImageStage("unlockment");
    playSound("petUnlocked");
  }, [current, playSound]);

  function dismiss() {
    setQueue((prev) => prev.slice(1));
  }

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
    [current],
  );

  if (!current) return null;

  const pet = getEquipmentById(current);
  const petName = pet?.name ?? PET_DROPS[current]?.npcLabel ?? current;
  const npcType = petNpcType({
    id: current,
    dropNpc: PET_DROPS[current]?.npcType ?? null,
  });
  const src = getImageSrc(npcType, imageStage);

  return (
    <div className="overlay">
      <div className={styles.flash} key={`flash-${current}`} />
      <div className={`modal ${styles.modal}`}>
        <span className={styles.title}>Novo pet desbloqueado!</span>
        {src && (
          <img
            key={src}
            decoding="async"
            className={styles.image}
            src={src}
            alt={petName}
            onError={() =>
              setImageStage((prev) =>
                prev === "unlockment" ? "fallback" : "none",
              )
            }
          />
        )}
        <span className={styles.name}>{petName}</span>

        <button className={styles.button} onClick={dismiss}>
          Continuar
        </button>
      </div>
    </div>
  );
}
