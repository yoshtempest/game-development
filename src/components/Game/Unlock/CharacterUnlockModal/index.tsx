import { useEffect, useState } from "react";
import { useCharacterUnlock } from "@/contexts/CharacterUnlockContext";
import { useGameControlsLayer } from "@/hooks/game/useGameControlsLayer";
import { useCharacterVoice } from "@/hooks/audio/useCharacterVoice";
import { useLatestRef } from "@/hooks/useLatestRef";
import { playerPath } from "@/utils/paths";
import { getCharacterName } from "@/data/options/characters";
import type { CharacterId } from "@/data/characters/list";

import styles from "./styles.module.css";

/**
 * Ordem de tentativa da arte da carta. `unlockment.svg` é a ilustração
 * dedicada (estilo carta de Yu-Gi-Oh); enquanto ela não existir para o
 * personagem, a carta cai no `face.svg` — que todo personagem jogável tem —
 * em vez de mostrar uma moldura vazia.
 */
const ART_FILES = ["unlockment.svg", "face.svg"] as const;

/**
 * Tempo da animação de virada (ms). Antes disso o "Continuar" fica bloqueado
 * para o jogador não pular a revelação apertando confirmar por reflexo — o
 * mesmo botão que acabou de fechar o diálogo/batalha que gerou o desbloqueio.
 */
const REVEAL_MS = 1400;

/** Respeita `prefers-reduced-motion`: sem animação, nada a esperar. */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

type CardProps = {
  character: CharacterId;
  onDismiss: () => void;
};

/**
 * Carta revelada de um personagem. Montada com `key={character}` pelo modal,
 * então cada desbloqueio da fila recomeça a animação e o fallback da arte do
 * zero, sem `setState` de reset em effect.
 */
function UnlockCard({ character, onDismiss }: CardProps) {
  const [artIndex, setArtIndex] = useState(0);
  const [revealed, setRevealed] = useState(prefersReducedMotion);
  const playVoice = useCharacterVoice();
  const playVoiceRef = useLatestRef(playVoice);
  const revealedRef = useLatestRef(revealed);
  const onDismissRef = useLatestRef(onDismiss);

  useEffect(() => {
    if (revealed) return;
    const id = window.setTimeout(() => setRevealed(true), REVEAL_MS);
    return () => window.clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed) playVoiceRef.current(character);
  }, [revealed, character, playVoiceRef]);

  useGameControlsLayer(
    {
      onUp: () => true,
      onDown: () => true,
      onLeft: () => true,
      onRight: () => true,
      onCancel: () => true,
      onConfirm: () => {
        if (revealedRef.current) onDismissRef.current();
        return true;
      },
      onUpRelease: () => {},
      onDownRelease: () => {},
      onLeftRelease: () => {},
      onRightRelease: () => {},
      onCancelRelease: () => {},
      onConfirmRelease: () => {},
      blockGlobalOpen: true,
    },
    [],
  );

  const name = getCharacterName(character);
  const artFile = ART_FILES[artIndex];

  return (
    <div className={`overlay ${styles.overlay}`}>
      <div className={styles.flash} aria-hidden="true" />
      <div
        className={styles.stage}
        role="dialog"
        aria-modal="true"
        aria-labelledby="character-unlock-title"
      >
        <p id="character-unlock-title" className={styles.headline}>
          Novo personagem desbloqueado!
        </p>

        <div className={styles.cardScene}>
          <div className={styles.card}>
            <div className={`${styles.face} ${styles.back}`} />
            <div className={`${styles.face} ${styles.front}`}>
              <span className={styles.cardName}>{name}</span>
              <div className={styles.artFrame}>
                {artFile && (
                  <img
                    decoding="async"
                    className={styles.art}
                    src={playerPath(`/${character}/${artFile}`)}
                    alt={name}
                    onError={() => setArtIndex((i) => i + 1)}
                  />
                )}
              </div>
              <span className={styles.cardFooter}>
                Agora disponível na seleção de personagens
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className={styles.button}
          onClick={onDismiss}
          disabled={!revealed}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

/**
 * Revelação de personagem desbloqueado (issue #143): carta virando com flash,
 * no estilo de invocação de Yu-Gi-Oh. A fila vem do `CharacterUnlockContext`;
 * o modal só mostra o primeiro e o `dismiss` revela o próximo.
 */
export function CharacterUnlockModal() {
  const { current, dismiss } = useCharacterUnlock();
  if (!current) return null;
  return <UnlockCard key={current} character={current} onDismiss={dismiss} />;
}
