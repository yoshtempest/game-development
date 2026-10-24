import { useMemo, useState, useCallback, useEffect } from "react";

import { SceneBase } from "@/components/Game/Scenes/Base";
import { DIRECTOR_SCENES } from "@/scenes/director";
import { getDirectorDialogue } from "@/scenes/director/one/dialogue";
import { createDirector } from "@/interactions/director";

import { useInventory } from "@/contexts/InventoryContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useQuestActions } from "@/hooks/quest/useQuestActions";
import { useFlags } from "@/contexts/FlagContext";
import { useNavigate, useLocation } from "react-router";
import { keyPath, resolveAsset } from "@/utils/paths";
import type { MessageCardConfig } from "@/utils/types/interaction";
import { useAudio } from "@/hooks/audio/useAudio";

import { sceneBackgrounds } from "@/data/scene/background";

import Talking from "@/components/Game/Interactions/Talking";
import { ImageModal } from "@/components/Game/Interactions/ImageModal";
import { MessageCard } from "@/components/Game/Interactions/MessageCard";

import { SISTEMA_SPRITE, useSystemTeleport } from "./useSystemTeleport";

type Props = {
  sceneId: SceneId;
};

export function DirectorScene({ sceneId }: Props) {
  const scene = DIRECTOR_SCENES[sceneId];
  const navigate = useNavigate();
  const location = useLocation();

  const { addItem, hasItem, removeItem, giveItem, npcGiveItem } =
    useInventory();
  const { progressQuest } = useQuestActions();
  const { hasFlag, setFlag } = useFlags();

  const [popup, setPopup] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageMessage, setImageMessage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [messageCardConfig, setMessageCardConfig] =
    useState<MessageCardConfig | null>(null);
  const gotKey = hasFlag("picked_director_key");

  const { sfxVolume } = useAudio();
  const sfxVolumeRef = useLatestRef(sfxVolume);

  const playSFX = useCallback(
    (src: string, volume = 1) => {
      const audio = new Audio(resolveAsset(src));
      audio.volume = volume * (sfxVolumeRef.current / 100);
      audio.play().catch(() => {});
    },
    [sfxVolumeRef],
  );

  const navigateFrom = useCallback(
    (to: string) => {
      void navigate(to, { state: { from: location.pathname } });
    },
    [navigate, location.pathname],
  );

  const interactions = useMemo(
    () =>
      createDirector({
        hasItem,
        addItem,
        removeItem,
        giveItem,
        npcGiveItem,
        navigate: navigateFrom,
        setPopup: (msg) => setPopup(msg),
        showImage: (src, message, name) => {
          setImageSrc(src);
          setImageMessage(message ?? null);
          setImageName(name ?? null);
        },
        showMessageCard: (config) => {
          setMessageCardConfig(config);
        },
        gotKey,
        setFlag,
        hasFlag,
        progressQuest,
        playSFX,
      }),
    [
      hasItem,
      addItem,
      removeItem,
      giveItem,
      npcGiveItem,
      navigateFrom,
      gotKey,
      setFlag,
      hasFlag,
      progressQuest,
      playSFX,
    ],
  );

  // ── Teleport do System ──
  // Só a cela tem o NPC — na sala do diretor `npcs` é vazio, então o efeito
  // simplesmente não aparece lá. `appear`/`leave` saem estáveis do hook, o que
  // mantém o array de diálogo e o efeito de montagem abaixo também estáveis.
  const isCel = sceneId === "one";
  const {
    src: systemSrc,
    className: systemClassName,
    hidden: systemHidden,
    appear: systemAppear,
    leave: systemLeave,
  } = useSystemTeleport();

  const dialogues = useMemo(
    () => getDirectorDialogue(systemLeave),
    [systemLeave],
  );

  // Ele começa fora do mapa e se materializa assim que a cena monta, junto com
  // o `autoStartDialogue` da cena.
  useEffect(() => {
    if (!isCel) return;
    systemAppear();
  }, [isCel, systemAppear]);

  const sceneWithSystem = useMemo(() => {
    if (!scene) return null;
    if (!isCel) return scene;

    return {
      ...scene,
      // `dialogueData` sai do `SceneConfig`: a última fala carrega o
      // `onConfirm` que faz o System piscar fora.
      dialogueData: dialogues,
      npcs: (scene.npcs ?? []).map((npc) =>
        npc.src === SISTEMA_SPRITE
          ? {
              ...npc,
              src: systemSrc,
              className: systemClassName,
              hidden: systemHidden,
            }
          : npc,
      ),
    };
  }, [scene, isCel, dialogues, systemSrc, systemClassName, systemHidden]);

  if (!sceneWithSystem) {
    return <div>Scene não encontrada</div>;
  }

  return (
    <>
      <SceneBase
        scene={sceneWithSystem}
        background={sceneBackgrounds.Director}
        interactions={interactions}
        itemPickupTiles={[
          {
            x: 18.4,
            y: 5,
            height: 2,
            visible: !gotKey,
            image: keyPath("director.svg"),
          },
        ]}
        popup={popup}
        setPopup={setPopup}
      />

      {/* ✅ popup continua fora */}
      {popup && <Talking name="System" message={popup} />}

      {imageSrc && (
        <ImageModal
          src={imageSrc}
          message={imageMessage ?? undefined}
          name={imageName ?? undefined}
          onClose={() => {
            setImageSrc(null);
            setImageMessage(null);
            setImageName(null);
          }}
        />
      )}

      {messageCardConfig && (
        <MessageCard
          title={messageCardConfig.title}
          subtitle={messageCardConfig.subtitle}
          description={messageCardConfig.description}
          numberedCount={messageCardConfig.numberedCount}
          onClose={() => setMessageCardConfig(null)}
        />
      )}
    </>
  );
}
