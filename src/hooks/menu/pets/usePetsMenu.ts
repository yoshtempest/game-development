import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useEquipment } from "@/contexts/EquipmentContext";
import { usePetProgress } from "@/contexts/PetProgressContext";
import { PETS } from "@/data/equipment/pets";
import { PET_DROPS } from "@/data/characters/pets/petDrops";
import {
  getPetSkillDefinition,
  getPetRole,
  type PetRole,
} from "@/data/characters/pets/petSkills";
import type { EquipmentRank } from "@/utils/types/player/equipment";
import { PET_STAR_MAX } from "@/data/characters/pets/petProgress";

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
  const {
    getCollection,
    getEquippedInfo,
    newlyUnlockedPetIds,
    acknowledgePets,
  } = useEquipment();
  const { getPetProgress } = usePetProgress();

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
        qtyByStar[equippedStar - 1] =
          (qtyByStar[equippedStar - 1] ?? 0) + 1;
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

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  useEffect(() => {
    setSelectedIndex((prev) => {
      if (pets.length === 0) return 0;
      return Math.min(prev, pets.length - 1);
    });
  }, [pets.length]);

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
      | HTMLElement
      | undefined;
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

  return {
    pets,
    ownedPets,
    equippedId: equippedInfo?.id ?? null,
    selectedIndex,
    setSelectedIndex,
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
