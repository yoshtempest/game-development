import { useEffect, useState } from "react";
import { useGameControls } from "@/contexts/GameControlsContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useEquipment } from "@/contexts/EquipmentContext";
import { usePetProgress } from "@/contexts/PetProgressContext";
import { useMenuSFX } from "@/hooks/menu/useMenuSFX";
import { useLatestRef } from "@/hooks/useLatestRef";
import {
  PET_STAR_MAX,
  enhanceFromPetStars,
} from "@/data/characters/pets/petProgress";
import type { PetEntry } from "@/hooks/menu/pets/usePetsMenu";
import type { EquippedItemInfo } from "@/utils/types/player/equipment";

type Props = {
  entry: PetEntry;
  onClose: () => void;
};

export function usePetDetail({ entry, onClose }: Props) {
  const { player } = usePlayer();
  const character = player.character;
  const {
    equip,
    unequip,
    fusePets,
    getEquippedInfo,
  } = useEquipment();
  const { getPetProgress, resetPetProgress } = usePetProgress();
  const { playMove, playSelect, playClose } = useMenuSFX();
  const { pushControls } = useGameControls();
  const pushControlsRef = useLatestRef(pushControls);

  const equippedInfo: EquippedItemInfo | null = getEquippedInfo(
    character,
    "pet",
  );
  const isEquipped = equippedInfo?.id === entry.id;

  const [selectedStar, setSelectedStar] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [fusing, setFusing] = useState<{ stars: number } | null>(null);

  const selectedStarRef = useLatestRef(selectedStar);
  const fusingRef = useLatestRef(fusing);
  const onCloseRef = useLatestRef(onClose);
  const entryRef = useLatestRef(entry);
  const equippedInfoRef = useLatestRef(equippedInfo);
  const equipRef = useLatestRef(equip);
  const unequipRef = useLatestRef(unequip);
  const fusePetsRef = useLatestRef(fusePets);
  const resetPetProgressRef = useLatestRef(resetPetProgress);
  const playMoveRef = useLatestRef(playMove);
  const playSelectRef = useLatestRef(playSelect);
  const playCloseRef = useLatestRef(playClose);

  function highestEligibleStar(): number {
    for (let s = PET_STAR_MAX - 1; s >= 1; s--) {
      if ((entryRef.current.qtyByStar[s - 1] ?? 0) >= 2) return s;
    }
    return 0;
  }

  function getPetStats(stars: number) {
    const progress = getPetProgress(entryRef.current.id, stars);
    return {
      stars,
      level: progress.level,
      xp: progress.xp,
    };
  }

  function canFuse(): boolean {
    return highestEligibleStar() > 0;
  }

  function ownedQtyByStar(star: number): number {
    return entryRef.current.qtyByStar[star - 1] ?? 0;
  }

  function equipPet() {
    const stars = selectedStarRef.current;
    const qty = ownedQtyByStar(stars);
    if (qty < 1) {
      playCloseRef.current();
      setMessage("Sem cópias desta estrela na coleção!");
      return;
    }
    // Equipa esta estrela, consumindo uma unidade.
    // Se já houvesse um pet equipado neste slot, ele volta para a coleção.
    equipRef.current(character, entryRef.current.id, enhanceFromPetStars(stars));
    playSelectRef.current();
    setMessage(`equipado (★${stars})`);
  }

  function unequipPet() {
    unequipRef.current(character, "pet");
    playSelectRef.current();
    setMessage(`desequipado`);
  }

  function startFuse(stars: number) {
    if (!canFuse()) return;
    setFusing({ stars });
    playSelectRef.current();
  }

  function executeFuse() {
    const current = fusingRef.current;
    if (!current) return;
    const stars = current.stars;
    const ok = fusePetsRef.current(character, entryRef.current.id, stars);
    if (!ok) {
      playCloseRef.current();
      setFusing(null);
      setMessage("Falha na fusão!");
      return;
    }
    resetPetProgressRef.current(entryRef.current.id, stars + 1);
    setFusing(null);
    playSelectRef.current();
    setMessage(
      `Fusão concluída! ★${stars} → ★${stars + 1}`,
    );
  }

  const equipPetRef = useLatestRef(equipPet);
  const unequipPetRef = useLatestRef(unequipPet);
  const executeFuseRef = useLatestRef(executeFuse);

  const cancelRef = useLatestRef(() => {
    if (fusingRef.current) {
      setFusing(null);
      playCloseRef.current();
      return true;
    }
    onCloseRef.current();
    return true;
  });

  useEffect(() => {
    const remove = pushControlsRef.current({
      onUp: () => {
        playMoveRef.current();
        setSelectedStar((prev) => (prev - 2 + PET_STAR_MAX) % PET_STAR_MAX + 1);
        return true;
      },
      onDown: () => {
        playMoveRef.current();
        setSelectedStar((prev) => (prev % PET_STAR_MAX) + 1);
        return true;
      },
      onLeft: () => {
        playMoveRef.current();
        setSelectedStar((prev) => (prev - 2 + PET_STAR_MAX) % PET_STAR_MAX + 1);
        return true;
      },
      onRight: () => {
        playMoveRef.current();
        setSelectedStar((prev) => (prev % PET_STAR_MAX) + 1);
        return true;
      },
      onConfirm: () => {
        if (fusingRef.current) {
          executeFuseRef.current();
          return true;
        }
        if (equippedInfoRef.current?.id === entryRef.current.id) {
          unequipPetRef.current();
        } else {
          equipPetRef.current();
        }
        return true;
      },
      onCancel: cancelRef.current,
      blockGlobalOpen: true,
    });
    return remove;
  }, [
    pushControlsRef,
    playMoveRef,
    fusingRef,
    cancelRef,
    equippedInfoRef,
    entryRef,
    executeFuseRef,
    unequipPetRef,
    equipPetRef,
  ]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  return {
    selectedStar,
    setSelectedStar,
    message,
    fusing,
    isEquipped,
    canFuse,
    highestEligibleStar,
    ownedQtyByStar,
    getPetStats,
    equipPet,
    unequipPet,
    startFuse,
    executeFuse,
    onClose: cancelRef.current,
  };
}
