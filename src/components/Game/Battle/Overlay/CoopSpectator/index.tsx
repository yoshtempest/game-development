import styles from "./styles.module.css";

type Props = {
  visible: boolean;
};

/**
 * Aviso do jogador caído no co-op 2v1. Sem ele a tela só congelava (controles
 * desligados) e parecia travamento, não "espere o parceiro terminar a luta".
 */
export function CoopSpectatorOverlay({ visible }: Props) {
  if (!visible) return null;
  return (
    <div className={styles.banner} role="status">
      <strong className={styles.title}>Você caiu!</strong>
      <span className={styles.subtitle}>Seu parceiro ainda está lutando…</span>
    </div>
  );
}
