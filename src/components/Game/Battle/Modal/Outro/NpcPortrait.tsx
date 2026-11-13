import { useState } from "react";

import { npcPath } from "@/utils/paths";
import type { BattleOutroResult } from "@/utils/types/battle/outro";

import styles from "./styles.module.css";

type Props = {
  npcType: string;
  result: BattleOutroResult;
  alt: string;
};

/**
 * Arquivos tentados, em ordem, para o retrato do NPC no outro. O sprite
 * dedicado (`victory.svg`/`defeat.svg`) ainda não existe para a maioria dos
 * NPCs, então cai no `face.svg` (o mesmo da lista de summons do HUD) e por fim no
 * `default.svg`, que todo NPC tem — o outro nunca mostra imagem quebrada.
 */
function getPortraitCandidates(
  npcType: string,
  result: BattleOutroResult,
): string[] {
  return [`${result}.svg`, "face.svg", "default.svg"].map((file) =>
    npcPath(`/${npcType}/${file}`),
  );
}

/**
 * Retrato do NPC no lado direito do `BattleOutro`, espelhando o do player.
 *
 * O índice do candidato atual é a única fonte de verdade: cada `onError`
 * avança um passo e, sem candidato restante, o retrato some em vez de
 * insistir num 404. `key` no componente pai reinicia a cadeia quando o NPC
 * ou o resultado mudam.
 */
export function NpcOutroPortrait({ npcType, result, alt }: Props) {
  const candidates = getPortraitCandidates(npcType, result);
  const [index, setIndex] = useState(0);
  const src = candidates[index];

  if (!src) return null;

  return (
    <img
      decoding="async"
      className={styles.npcPortrait}
      src={src}
      alt={alt}
      onError={() => setIndex((i) => i + 1)}
    />
  );
}
