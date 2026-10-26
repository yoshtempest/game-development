import { useRef, useEffect } from "react";
import { usePetDetail } from "@/hooks/menu/pets/usePetDetail";
import type { PetEntry } from "@/hooks/menu/pets/usePetsMenu";
import { FusionOverlay } from "../FusionOverlay";
import styles from "./styles.module.css";
import { PetDetailHeader } from "./Header";
import { PetArtwork } from "./ArtWork"
import { PetIdentity } from "./Identity";
import { PetAbilities } from "./Abilities";
import { PetAttributes } from "./Attributes";
import { PetStarSelector } from "./StarSelector";

type Props = {
  entry: PetEntry;
  onClose: () => void;
};

export function PetDetail({ entry, onClose }: Props) {
  const {
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
    onClose: handleClose,
  } = usePetDetail({ entry, onClose });

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.children[selectedStar - 1] as
      | HTMLElement
      | undefined;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedStar]);

  const petNpc = entry.dropNpc ?? entry.id.replace("pet_", "");
  const eligible = highestEligibleStar();
  const stats = ownedQtyByStar(selectedStar) > 0
    ? getPetStats(selectedStar)
    : null;

  return (
    <>
      <div className={`containerOfNavbar ${styles.pokedex}`}>
        <PetDetailHeader name={entry.name} onClose={handleClose}/>
        <main className={styles.pokedexContent}>
          {/* Ficha principal */}
          <section className={styles.identitySection}>
            <PetArtwork 
              name={entry.name}
              message={message}
              petNpc={petNpc}
              entry={entry}
              selectedStar={selectedStar}
              eligible={eligible}
              isEquipped={isEquipped}
              fusing={!!fusing}
              canFuse={canFuse}
              startFuse={startFuse}
              executeFuse={executeFuse}
              equipPet={equipPet}
              unequipPet={unequipPet}
            />

            <div className={styles.identityInfo}>
              <PetIdentity entry={entry} />

              <PetAttributes
                entry={entry}
                petNpc={petNpc}
                stats={stats}
              />
            </div>
            
          </section>

          <PetAbilities entry={entry}/>

          <PetStarSelector
            selectedStar={selectedStar}
            setSelectedStar={setSelectedStar}
            ownedQtyByStar={ownedQtyByStar}
          />
        </main>
      </div>

      {fusing && (
        <FusionOverlay
          entry={entry}
          stars={fusing.stars}
          onComplete={executeFuse}
        />
      )}
    </>
  );
}
