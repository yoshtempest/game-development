import { CHARACTERS } from "@/data/options/characters";
import { playerPath } from "@/utils/paths";

import styles from "./styles.module.css";

type Props = {
  /** Personagem cujo Status está em tela (não é necessariamente o personagem em uso). */
  selectedCharacterId: CharacterId;
  onSelect: (characterId: CharacterId) => void;
};

/**
 * Seletor de faces acima dos pontos.
 *
 * Troca apenas o personagem inspecionado pelo Status; para torná-lo o ativo o
 * jogador continua usando o botão "Selecionar" do `CharacterInfo`. Assim dá para
 * conferir e distribuir pontos de qualquer personagem sem trocar o avatar atual.
 */
export function CharacterFaces({ selectedCharacterId, onSelect }: Props) {
  return (
    <div className={styles.facesRow}>
      {CHARACTERS.map((character) => {
        const isSelected = character.image === selectedCharacterId;
        const fallback = playerPath(
          `/${character.image}/expressions/default.svg`,
        );

        return (
          <button
            key={character.image}
            type="button"
            className={`${styles.faceButton} ${
              isSelected ? styles.active : ""
            }`}
            onClick={() => onSelect(character.image)}
            aria-label={`Ver status de ${character.name}`}
            aria-pressed={isSelected}
            title={character.name}
          >
            <img
              loading="lazy"
              decoding="async"
              src={playerPath(`/${character.image}/face.svg`)}
              alt=""
              className={styles.face}
              // Nem todo personagem tem `face.svg`; o retrato de expressão
              // padrão já existe para todos e evita um quadrado quebrado.
              onError={(event) => {
                if (!event.currentTarget.src.endsWith(fallback)) {
                  event.currentTarget.src = fallback;
                }
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
