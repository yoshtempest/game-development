import styles from "./styles.module.css";

type Props = {
  mounted: boolean;
  onToggle: () => void;
};

/**
 * Botão de montar/desmontar para quem joga no touch, onde não existe a tecla
 * `R`. Só aparece com pet de montaria equipado (quem decide é a cena).
 */
export function MountToggle({ mounted, onToggle }: Props) {
  return (
    <button type="button" className={styles.button} onClick={onToggle}>
      {mounted ? "Desmontar (R)" : "Montar (R)"}
    </button>
  );
}
