import styles from "./styles.module.css";

/**
 * Animação "Clear" que aparece quando o inimigo principal é derrotado.
 * - Background preto 10% opacidade cobrindo 100% largura × 60% altura da área central
 * - Texto "Clear" deslizando da esquerda para direita
 * - Duração total: ~1.5s
 * - O estado é controlado pelo hook useBattleOutro (timeout de 1.5s)
 */
export function BattleClear() {
  return (
    <div className={styles.overlay}>
      <div className={styles.clearText}>Clear</div>
    </div>
  );
}