import styles from "./styles.module.css";
import { MoveUp, MoveDown, MoveLeft, MoveRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useSoundEffects } from "@/contexts/SoundEffectsContext";
import { createConfigsDialogue } from "@/data/dialogues/configs";
import Talking from "@/components/Game/Interactions/Talking";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useStableCallback } from "@/hooks/useStableCallback";
import { useDialogue } from "@/hooks/interaction/useDialogue";
import { npcPath } from "@/utils/paths";

/**
 * Fases do teleport que abre o tutorial. `out` dissolve o Victor deitado,
 * `beam` troca o retrato pelo feixe e `in` o materializa em pé — ao fim de `in` a
 * conversa é retomada e ele finalmente se apresenta.
 */
type TeleportPhase = "idle" | "out" | "beam" | "in";

type TeleportEffectPhase = Exclude<TeleportPhase, "idle">;

/**
 * Janela de cada fase em ms. Espelha as durações das classes em
 * src/styles/teleport.css; um descompasso aqui só corta o efeito no limite da
 * fase, nunca desalinha a conversa.
 */
const TELEPORT_PHASE_MS: Record<TeleportEffectPhase, number> = {
  out: 240,
  beam: 420,
  in: 320,
};

/** Arte de cada fase — o feixe é o próprio `teleport.svg` do Victor. */
const TELEPORT_PHASE_SRC: Record<TeleportEffectPhase, string> = {
  out: npcPath("/victor/lyingDown.svg"),
  beam: npcPath("/victor/teleport.svg"),
  in: npcPath("/victor/talking.svg"),
};

const NEXT_TELEPORT_PHASE: Record<TeleportEffectPhase, TeleportPhase> = {
  out: "beam",
  beam: "in",
  in: "idle",
};

/**
 * Classe global de animação de cada fase. Não pode viver no
 * `styles.module.css`: o postcss-modules reescreve o nome do `@keyframes`
 * referenciado por um módulo e a animação deixaria de casar com o keyframe
 * global em src/styles/teleport.css.
 */
const TELEPORT_PHASE_CLASS: Record<TeleportEffectPhase, string> = {
  out: "teleportDissolve",
  beam: "teleportBeamIn",
  in: "teleportSpawn",
};

export function VictorTutorial() {
  const [teleportPhase, setTeleportPhase] = useState<TeleportPhase>("idle");

  const { playSound } = useSoundEffects();

  /**
   * `onConfirm` da linha "...": devolve `false` para travar a conversa e deixar
   * o efeito rodar em paz — o avanço vem da última fase, não do input.
   */
  const startTeleport = useStableCallback(() => {
    setTeleportPhase("out");
    return false;
  });

  const dialogues = useMemo(
    () => createConfigsDialogue(startTeleport),
    [startTeleport],
  );

  const dialogueSystem = useDialogue(dialogues);
  const dialogueSystemRef = useLatestRef(dialogueSystem);

  useEffect(() => {
    dialogueSystemRef.current.start();
  }, [dialogueSystemRef]);

  // Encadeia out → beam → in → idle e, no fim, devolve a linha ao diálogo.
  useEffect(() => {
    if (teleportPhase === "idle") return;

    const nextPhase = NEXT_TELEPORT_PHASE[teleportPhase];
    const timer = setTimeout(() => {
      setTeleportPhase(nextPhase);
      if (nextPhase === "idle") {
        dialogueSystemRef.current.next();
      }
    }, TELEPORT_PHASE_MS[teleportPhase]);

    return () => clearTimeout(timer);
  }, [teleportPhase, dialogueSystemRef]);

  // O som entra junto com o feixe: `beam` é a única fase em que o retrato é o
  // `teleport.svg`, então basta entrar nela para o `blink` casar com a arte.
  useEffect(() => {
    if (teleportPhase === "beam") {
      playSound("blink");
    }
  }, [teleportPhase, playSound]);

  const handleNext = useStableCallback(() => {
    // Com o teleport em curso a linha está presa: confirmar de novo não pode
    // atropelar a animação.
    if (teleportPhase !== "idle") return;
    dialogueSystemRef.current.next();
  });

  const line = dialogueSystem.dialogue;
  const isTeleporting = teleportPhase !== "idle";
  const portraitSrc = isTeleporting
    ? TELEPORT_PHASE_SRC[teleportPhase]
    : line?.src;

  return (
    <div className={styles.tutorialContainer}>
      {dialogueSystem.isOpen && line && (
        <div
          className={`${styles.talking}${isTeleporting ? ` ${styles.teleport}` : ""}`}
          data-teleport-phase={teleportPhase}
        >
          <Talking
            {...line}
            src={portraitSrc}
            onNext={handleNext}
            imageClassName={
              isTeleporting ? TELEPORT_PHASE_CLASS[teleportPhase] : undefined
            }
          />
        </div>
      )}

      {!dialogueSystem.isOpen && (
        <>
          <h3>Como funciona a movimentação:</h3>
          <div className={styles.row}>
            <div className={styles.movement}>
              <MoveUp size={16} className={styles.up} />

              <MoveLeft size={16} className={styles.left} />

              <div className={styles.empty}></div>

              <MoveRight size={16} className={styles.right} />

              <MoveDown size={16} className={styles.down} />
            </div>

            <div className={`dpad ${styles.dpad}`}>
              <div className="inner" />
            </div>

            <p>Basta apertar na direção que você deseja ir.</p>
          </div>
          <h3>Como funcionam os controles:</h3>
          <div className={styles.row}>
            <div className={styles.gameButtons}>
              <button className={styles.button}>B</button>
            </div>
            <p>
              Ao clicar em "B" enquanto está em batalha, você consegue bloquear
              ataques, Além disso, também pode ser usado para fechar os menus.
            </p>
          </div>
          <div className={styles.row}>
            <button className={styles.button}> L </button>
            <p>
              Ao clicar em "L", você consegue interagir com as pessoas e com o
              mapa, caso esteja em batalha, você ataca, caso pressione e segure
              você irá carregar ataque mais forte.
            </p>
          </div>
          <div className={styles.row}>
            <button className={styles.open} />
            <p>
              Ao clicar em "G" pelo teclado ou nesse quadrado retangular, você
              consegue abrir os menus, assim como você fez agora. Em batalha, as
              habilidades ativas de cada personagem aparecem em botões na tela.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
