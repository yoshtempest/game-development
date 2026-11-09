import { getCharacterElementTypes } from "@/data/types/characterElementTypes";
import { elementBadgePath } from "@/utils/paths";

import styles from "./styles.module.css";

type Props = {
  character: CharacterId;
};

/**
 * Tipagens elementais do personagem.
 *
 * O menu de Status é onde o jogador descobre com que elemento ele luta, então é
 * aqui que a tipagem fica visível. Lê a mesma tabela do funil de dano
 * (`getCharacterElementTypes`) — nada de versão paralela para a UI.
 */
export function CharacterElements({ character }: Props) {
  const types = getCharacterElementTypes(character);

  return (
    <div className={styles.panel}>
      <ul className={styles.types}>
        {types.map((type) => (
          <li key={type}>
            <img loading="lazy" decoding="async"
              src={elementBadgePath(`${type.toLowerCase()}.svg`)}
              className={styles.badge}
              alt={type}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
