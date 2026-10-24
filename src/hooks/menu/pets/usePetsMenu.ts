import { useEffect, useRef, useState } from "react";
import { useGameControls } from "@/contexts/GameControlsContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useEquipment } from "@/contexts/EquipmentContext";
import { usePetProgress } from "@/contexts/PetProgressContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useMenuSFX } from "@/hooks/menu/useMenuSFX";
import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { PETS } from "@/data/equipment/pets";
import { PET_DROPS } from "@/data/characters/pets/petDrops";
import {
  getPetSkillDefinition,
  getPetRole,
  type PetRole,
} from "@/data/characters/pets/petSkills";
import type { EquipmentRank } from "@/utils/types/player/equipment";
import { PET_STAR_MAX } from "@/data/characters/pets/petProgress";
import { gridMove } from "@/gameRules/menu/navigation";

export type PetEntry = {
  id: EquipmentId;
  name: string;
  rank: EquipmentRank;
  role: PetRole;
  skillName: string;
  passiveName: string;
  owned: boolean;
  qtyByStar: number[];
  dropNpc: string | null;
  dropLabel: string | null;
  dropChance: number | null;
  riddle: string | null;
};

function parseCollectionKey(key: string): { id: string; enhance: number } {
  const i = key.lastIndexOf("+");
  if (i > 0) {
    const enhance = parseInt(key.slice(i + 1), 10);
    if (!isNaN(enhance)) return { id: key.slice(0, i), enhance };
  }
  return { id: key, enhance: 0 };
}

export function usePetsMenu(
  isOpen: boolean,
  listRef?: React.RefObject<HTMLDivElement | null>,
) {
  const { player } = usePlayer();
  const character = player.character;
  const { pushControls } = useGameControls();
  const {
    getCollection,
    getEquippedInfo,
    fusePets,
    newlyUnlockedPetIds,
    acknowledgePets,
  } = useEquipment();
  const { getPetProgress, resetPetProgress } = usePetProgress();
  const { playMove, playSelect, playClose } = useMenuSFX();
  const { playSound } = useSoundEffects();

  const collection = getCollection(character);
  const equippedInfo = getEquippedInfo(character, "pet");

  const pets: PetEntry[] = PETS.map((pet) => {
    const dropInfo = PET_DROPS[pet.id];
    const skillDef = getPetSkillDefinition(pet.id);
    const qtyByStar: number[] = Array.from({ length: PET_STAR_MAX }, () => 0);
    for (const [key, qty] of Object.entries(collection)) {
      const { id, enhance } = parseCollectionKey(key);
      if (id !== pet.id) continue;
      const star = enhance + 1;
      if (star >= 1 && star <= PET_STAR_MAX)
        qtyByStar[star - 1] = (qtyByStar[star - 1] ?? 0) + qty;
    }
    if (equippedInfo?.id === pet.id) {
      const equippedStar = equippedInfo.enhance + 1;
      if (equippedStar >= 1 && equippedStar <= PET_STAR_MAX) {
        qtyByStar[equippedStar - 1] = (qtyByStar[equippedStar - 1] ?? 0) + 1;
      }
    }
    const owned =
      qtyByStar.some((qty) => qty > 0) || equippedInfo?.id === pet.id;
    // Após desbloqueado, chance de drop passa de 0% para 0.1%
    let finalDropChance = dropInfo?.chance ?? null;
    if (owned && dropInfo?.chance === 0) {
      finalDropChance = 0.001; // 0.1%
    }
    return {
      id: pet.id,
      name: pet.name,
      rank: pet.rank,
      role: getPetRole(pet.id),
      skillName: skillDef?.skill.name ?? "—",
      passiveName: skillDef?.passive.name ?? "—",
      owned,
      qtyByStar,
      dropNpc: dropInfo?.npcType ?? null,
      dropLabel: dropInfo?.npcLabel ?? null,
      dropChance: finalDropChance,
      riddle: dropInfo?.riddle ?? null,
    };
  });

  const ownedPets = pets.filter((pet) => pet.owned);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedIndexRef = useRef(selectedIndex);
  const [pendingStar, setPendingStar] = useState(0);
  const [fusing, setFusing] = useState<{
    petId: string;
    stars: number;
  } | null>(null);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  useEffect(() => {
    setPendingStar(0);
  }, [selectedIndex]);

  useEffect(() => {
    setSelectedIndex((prev) => {
      if (pets.length === 0) return 0;
      return Math.min(prev, pets.length - 1);
    });
  }, [pets.length]);

  useEffect(() => {
    if (fusing) setPendingStar(0);
  }, [fusing]);

  const prevOpenRef = useRef(isOpen);
  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = isOpen;
    if (wasOpen && !isOpen && newlyUnlockedPetIds.length > 0) {
      acknowledgePets(newlyUnlockedPetIds);
    }
  }, [isOpen, newlyUnlockedPetIds, acknowledgePets]);

  const prevSelectedIndexRef = useRef(selectedIndex);
  useEffect(() => {
    if (!isOpen || !listRef?.current) return;
    const prev = prevSelectedIndexRef.current;
    prevSelectedIndexRef.current = selectedIndex;
    if (selectedIndex === prev) return;
    const container = listRef.current;
    const selectedElement = container.children[selectedIndex] as
      HTMLElement | undefined;
    if (!selectedElement) return;
    selectedElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [isOpen, selectedIndex, pets, listRef]);

  function maxOwnedStar(entry: PetEntry): number {
    for (let s = PET_STAR_MAX; s >= 1; s--) {
      if ((entry.qtyByStar[s - 1] ?? 0) > 0) return s;
    }
    return 0;
  }

  function highestEligibleStar(entry: PetEntry): number {
    for (let s = PET_STAR_MAX - 1; s >= 1; s--) {
      if ((entry.qtyByStar[s - 1] ?? 0) >= 2) return s;
    }
    return 0;
  }

  const playMoveRef = useLatestRef(playMove);
  const playSelectRef = useLatestRef(playSelect);
  const playCloseRef = useLatestRef(playClose);
  const playSoundRef = useLatestRef(playSound);
  const pushControlsRef = useLatestRef(pushControls);
  const fusePetsRef = useLatestRef(fusePets);
  const resetPetProgressRef = useLatestRef(resetPetProgress);
  const characterRef = useLatestRef(character);
  const petsRef = useLatestRef(pets);
  const pendingStarRef = useLatestRef(pendingStar);
  const fusingRef = useLatestRef(fusing);
  const highestEligibleStarRef = useLatestRef(highestEligibleStar);

  function executeFuse(entry: PetEntry, stars: number) {
    const ok = fusePetsRef.current(characterRef.current, entry.id, stars);
    if (!ok) {
      playCloseRef.current();
      return;
    }
    resetPetProgressRef.current(entry.id, stars + 1);
    playSoundRef.current("receivedItem");
    playSelectRef.current();
  }

  const confirmRef = useRef<() => boolean>(() => false);
  confirmRef.current = () => {
    if (fusingRef.current) return true;
    const entry = petsRef.current[selectedIndexRef.current];
    if (!entry || !entry.owned) return true;
    const stars = highestEligibleStarRef.current(entry);
    if (stars < 1) return true;

    if (pendingStarRef.current !== 0) {
      const fusingEntry = entry;
      setPendingStar(0);
      setFusing({ petId: fusingEntry.id, stars });
      playSoundRef.current("receivedItem");
      return true;
    }

    setPendingStar(stars);
    playSelectRef.current();
    return true;
  };

  const cancelRef = useRef<() => boolean>(() => false);
  cancelRef.current = () => {
    if (fusingRef.current) return true;
    if (pendingStarRef.current !== 0) {
      setPendingStar(0);
      playCloseRef.current();
      return true;
    }
    return false;
  };

  const finishFusion = () => {
    const current = fusingRef.current;
    if (!current) return;

    const entry = petsRef.current.find((p) => p.id === current.petId);
    setFusing(null);
    if (!entry) return;

    executeFuse(entry, current.stars);
  };

  useEffect(() => {
    if (!isOpen) return;

    const controls = {
      onRight: () => {
        playMoveRef.current();
        setSelectedIndex((prev) =>
          gridMove(prev, 2, "right", petsRef.current.length),
        );
      },
      onLeft: () => {
        playMoveRef.current();
        setSelectedIndex((prev) =>
          gridMove(prev, 2, "left", petsRef.current.length),
        );
      },
      onDown: () => {
        playMoveRef.current();
        setSelectedIndex((prev) =>
          gridMove(prev, 2, "down", petsRef.current.length),
        );
      },
      onUp: () => {
        playMoveRef.current();
        setSelectedIndex((prev) =>
          gridMove(prev, 2, "up", petsRef.current.length),
        );
      },
      onConfirm: () => confirmRef.current(),
      onCancel: () => cancelRef.current(),
      blockGlobalOpen: true,
    };

    const remove = pushControlsRef.current(controls);
    return () => remove();
  }, [isOpen, petsRef, playMoveRef, pushControlsRef]);

  return {
    pets,
    ownedPets,
    equippedId: equippedInfo?.id ?? null,
    selectedIndex,
    pendingStar,
    fusing,
    finishFusion,
    newlyUnlockedPetIds,
    acknowledgePets,
    maxOwnedStar,
    highestEligibleStar,
    statsFor: (entry: PetEntry) => {
      let stars = maxOwnedStar(entry);
      if (stars < 1 && equippedInfo?.id === entry.id) {
        stars = equippedInfo.enhance + 1;
      }
      if (stars < 1) return null;
      const progress = getPetProgress(entry.id, stars);
      return {
        stars,
        level: progress.level,
        xp: progress.xp,
      };
    },
  };
}
