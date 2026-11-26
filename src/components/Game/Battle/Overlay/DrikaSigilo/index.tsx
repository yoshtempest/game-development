import { useEffect, useState } from "react";

import type { CharacterId } from "@/data/characters/list";
import { playerPath } from "@/utils/paths";

type Props = {
  character: CharacterId;
  playerX: number;
  playerY: number;
  pentagramVisible: boolean;
  selectedArmIcon: string | null;
};

/**
 * Duração do fade-out do pentagrama e da arma invocada ao fim do Sigilo.
 *
 * O `useSigilo` desliga `pentagramVisible` e `selectedArmIcon` no mesmo tick em
 * que a arma é equipada; sem esta janela os dois sumiriam de uma vez, e a issue
 * #330 pede que desapareçam com fade-out.
 */
const SIGILO_FADE_OUT_MS = 400;

/**
 * Pentagrama de sangue + arma invocada acima dele durante o Sigilo da Drika.
 *
 * O fade-out é resolvido aqui, e não no hook, para não ter que propagar um
 * estado novo por `BattleSceneApi` e pelo snapshot remoto (`RemoteVisuals`):
 * o overlay guarda o último ícone e, quando o pentagrama passa de visível para
 * oculto, segue renderizando por `SIGILO_FADE_OUT_MS` com a animação de saída.
 * A detecção da transição usa o padrão "estado da prop anterior" do React (ajuste
 * durante o render), porque `setState` síncrono dentro de effect é barrado pelo
 * `react-hooks` do projeto.
 */
export function DrikaSigiloOverlay({
  character,
  playerX,
  playerY,
  pentagramVisible,
  selectedArmIcon,
}: Props) {
  const [prevVisible, setPrevVisible] = useState(pentagramVisible);
  const [fadingOut, setFadingOut] = useState(false);
  const [lastArmIcon, setLastArmIcon] = useState<string | null>(
    selectedArmIcon,
  );

  if (prevVisible !== pentagramVisible) {
    setPrevVisible(pentagramVisible);
    setFadingOut(!pentagramVisible);
  }
  if (selectedArmIcon !== null && selectedArmIcon !== lastArmIcon) {
    setLastArmIcon(selectedArmIcon);
  }

  useEffect(() => {
    if (!fadingOut) return;
    const timer = setTimeout(() => {
      setFadingOut(false);
      setLastArmIcon(null);
    }, SIGILO_FADE_OUT_MS);
    return () => clearTimeout(timer);
  }, [fadingOut]);

  if (character !== "drika") return null;

  const showPentagram = pentagramVisible || fadingOut;
  const armIcon = selectedArmIcon ?? (fadingOut ? lastArmIcon : null);
  const armAnimation = fadingOut
    ? `sigiloArmFadeOut ${SIGILO_FADE_OUT_MS}ms ease forwards`
    : undefined;

  return (
    <>
      {(showPentagram || armIcon) && (
        <style>{`@keyframes sigiloFadeIn { from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
@keyframes sigiloFadeOut { from { opacity: 1; transform: translate(-50%, -50%) scale(1); } to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); } }
@keyframes sigiloArmFadeOut { from { opacity: 1; } to { opacity: 0; } }`}</style>
      )}

      {showPentagram && (
        <img
          src={playerPath("/drika/inFight/habilities/sigilo/pentagram.svg")}
          alt="pentagram"
          style={{
            position: "absolute",
            left: playerX,
            top: playerY,
            transform: "translate(-50%, -50%)",
            animation: fadingOut
              ? `sigiloFadeOut ${SIGILO_FADE_OUT_MS}ms ease forwards`
              : "sigiloFadeIn 0.3s ease forwards",
            pointerEvents: "none",
            zIndex: 5,
          }}
        />
      )}

      {armIcon && (
        <img
          src={playerPath(`/drika/inFight/arms/${armIcon}`)}
          alt="selected arm"
          style={{
            position: "absolute",
            left: playerX,
            top: playerY - 40,
            transform: "translate(-50%, -100%)",
            animation: armAnimation,
            pointerEvents: "none",
            zIndex: 6,
          }}
        />
      )}
    </>
  );
}
