import { useState } from "react";

import {
  REWIND_GALAXY_BACKGROUND,
  TIME_POLICE_COUNT,
  TIME_POLICE_LEVEL,
  TIME_POLICE_NAME,
  TIME_POLICE_SPRITE,
} from "@/data/battle/timePolice";
import { npcPath, playerPathSrGuaxinimHabilities } from "@/utils/paths";

import styles from "./styles.module.css";

type Props = {
  /** Retrocesso Temporal em reprodução. */
  active: boolean;
  /** Resultado do sorteio de 1% feito no início do retrocesso. */
  timePoliceVisible: boolean;
};

const POLICE_SLOTS = Array.from({ length: TIME_POLICE_COUNT }, (_, i) => i);

/**
 * Fundo galáctico do Retrocesso Temporal do Artur (`srGuaxinim`) e, no easter
 * egg de 1%, os três policiais do tempo observando.
 *
 * Os policiais são só visuais, de propósito: a issue diz que eles não atacam,
 * apenas observam, então entrar como `NpcType` obrigaria ataque, multiplicadores
 * e bestiário para uma entidade que nunca luta.
 *
 * As artes (`rewindTime/background.svg` e `timePolice/idle.svg`) ainda podem não
 * existir: o gradiente CSS segura o fundo e a silhueta CSS segura o policial
 * quando a imagem falha, para o efeito nunca aparecer como ícone quebrado.
 */
export function TimeRewindOverlay({ active, timePoliceVisible }: Props) {
  const [backgroundFailed, setBackgroundFailed] = useState(false);
  const [policeSpriteFailed, setPoliceSpriteFailed] = useState(false);

  if (!active) return null;

  return (
    <div className={styles.overlay} aria-hidden="true">
      {!backgroundFailed && (
        <img
          className={styles.background}
          src={playerPathSrGuaxinimHabilities(REWIND_GALAXY_BACKGROUND)}
          alt=""
          decoding="async"
          onError={() => setBackgroundFailed(true)}
        />
      )}

      {timePoliceVisible && (
        <div className={styles.police}>
          {POLICE_SLOTS.map((slot) => (
            <div key={slot} className={styles.officer}>
              <span className={styles.tag}>
                {TIME_POLICE_NAME} · Nv. {TIME_POLICE_LEVEL}
              </span>
              {policeSpriteFailed ? (
                <div className={styles.silhouette} />
              ) : (
                <img
                  className={styles.sprite}
                  src={npcPath(TIME_POLICE_SPRITE)}
                  alt={TIME_POLICE_NAME}
                  decoding="async"
                  onError={() => setPoliceSpriteFailed(true)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
