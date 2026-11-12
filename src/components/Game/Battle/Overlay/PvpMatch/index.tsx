import { ChoiceBox } from "@/components/Game/Interactions/ChoiceBox";
import type { PvpMatch } from "@/hooks/battle/pvp/usePvpMatch";
import styles from "./styles.module.css";

type Props = {
  match: PvpMatch;
  opponentName: string;
};

const ROUND_TEXT = {
  win: "Você venceu o round!",
  loss: "Você perdeu o round",
  draw: "Empate — ninguém pontua",
} as const;

/**
 * Placar e fluxo da série do duelo. O placar fica sempre visível; o banner de
 * round e o fim da série cobrem a arena, e o fim usa `ChoiceBox` para seguir
 * funcionando com teclado e toque como o resto dos menus.
 */
export function PvpMatchOverlay({ match, opponentName }: Props) {
  const {
    phase,
    round,
    bestOf,
    wins,
    lastResult,
    matchResult,
    walkover,
    opponentLeft,
    rematchRequested,
    opponentRematch,
    requestRematch,
    leave,
  } = match;

  const canRematch = !opponentLeft && !rematchRequested;
  const options = canRematch ? ["Revanche", "Sair"] : ["Sair"];

  /**
   * O resultado vai no prompt da `ChoiceBox`: ela ocupa o centro da tela com
   * fundo próprio, e texto solto atrás dela ficava escondido.
   */
  const endPrompt = [
    matchResult === "win" ? "Vitória!" : "Derrota",
    walkover
      ? `${opponentName} saiu do duelo.`
      : `Placar final: ${wins.me} × ${wins.opponent}.`,
    opponentLeft && !walkover ? `${opponentName} saiu.` : null,
    rematchRequested && !opponentLeft
      ? `Aguardando ${opponentName} aceitar a revanche…`
      : null,
    !rematchRequested && opponentRematch && !opponentLeft
      ? `${opponentName} quer revanche!`
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className={styles.scoreboard} role="status">
        <span className={styles.score}>
          Você {wins.me} × {wins.opponent} {opponentName}
        </span>
        <span className={styles.detail}>
          {bestOf === 1 ? "Duelo único" : `Melhor de ${bestOf}`} · Round{" "}
          {round}
        </span>
      </div>

      {phase === "waiting" && (
        <div className={styles.banner}>
          <strong className={styles.title}>Aguardando oponente…</strong>
        </div>
      )}

      {phase === "roundEnd" && lastResult && (
        <div className={styles.banner}>
          <strong className={styles.title}>{ROUND_TEXT[lastResult]}</strong>
          <span className={styles.detail}>Próximo round em instantes</span>
        </div>
      )}

      {phase === "matchEnd" && (
        <div className={styles.endScreen}>
          <ChoiceBox
            key={`${options.join("|")}:${endPrompt}`}
            prompt={endPrompt}
            options={options}
            onSelect={(index) => {
              if (options[index] === "Revanche") requestRematch();
              else leave();
            }}
          />
        </div>
      )}
    </>
  );
}
