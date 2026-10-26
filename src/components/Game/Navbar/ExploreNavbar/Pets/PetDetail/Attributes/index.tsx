import { elementBadgePath } from "@/utils/paths";
import { PET_ROLE_LABELS } from "@/data/characters/pets/petSkills";
import { getNpcElementTypes } from "@/data/types/npcElementTypes";
import type { PetEntry } from "@/hooks/menu/pets/usePetsMenu";
import styles from "./styles.module.css";
import { PetExperience } from "@/components/Game/Navbar/ExploreNavbar/Pets/PetDetail/Experience";
import type { PetStats } from "@/components/Game/Navbar/ExploreNavbar/Pets/PetDetail/Experience";

interface PetAttributesProps {
  entry: PetEntry;
  petNpc: string;
  stats: PetStats | null;
}

function formatDrop(entry: PetEntry): string {
  if (entry.dropChance === null) return "Baú";

  const percentage = (entry.dropChance * 100).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  });

  return `${percentage}%`;
}

export function PetAttributes({ entry, petNpc, stats }: PetAttributesProps) {
  const elements = getNpcElementTypes(petNpc);

  return (
    <>
      <div className={styles.attributeGrid}>
        <div className={styles.attributeCard}>
          <span className={styles.attributeLabel}>FUNÇÃO</span>
          <strong>{PET_ROLE_LABELS[entry.role]}</strong>
        </div>

        <div className={styles.attributeCard}>
          <span className={styles.attributeLabel}>ELEMENTO</span>

          <div className={styles.elementList}>
            {elements.map((element) => (
              <img
                key={element}
                src={elementBadgePath(`${element.toLowerCase()}.svg`)}
                alt={element}
                title={element}
                className={styles.elementBadge}
              />
            ))}
          </div>
        </div>

        <div className={styles.attributeCard}>
          <span className={styles.attributeLabel}>CHANCE DE DROP</span>
          <strong>{formatDrop(entry)}</strong>
        </div>
      </div>

      {entry.riddle && (
        <div className={styles.riddleCard}>
          <span className={styles.attributeLabel}>COMO ENCONTRAR</span>
          <p>{entry.riddle}</p>
        </div>
      )}

      <div className={styles.riddleCard}>
        <span className={styles.attributeLabel}>LOCALIZAÇÃO</span>
        <p>{entry.location ?? "Não descoberto"}</p>
      </div>

      <div className={styles.riddleCard}>
        {!entry.owned && (
          <span className={styles.statusLocked}>AINDA NÃO DESBLOQUEADO</span>
        )}

        {stats && <PetExperience entry={entry} stats={stats} />}
      </div>
    </>
  );
}
