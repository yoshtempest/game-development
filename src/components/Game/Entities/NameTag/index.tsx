import styles from "./styles.module.css";

type Props = {
  name: string;
  /**
   * O container do sprite de exploração espelha com `scaleX(-1)` quando o
   * personagem olha para a esquerda; o nick desfaz o espelho para continuar
   * legível.
   */
  mirrored?: boolean;
};

/**
 * Nick flutuando acima de outro jogador online (estilo Minecraft). Vai dentro
 * do container do sprite, então acompanha posição, transição e profundidade
 * do personagem sem cálculo próprio.
 */
export function NameTag({ name, mirrored = false }: Props) {
  return (
    <span
      className={`${styles.tag} ${mirrored ? styles.mirrored : ""}`}
      aria-label={`Jogador ${name}`}
    >
      {name}
    </span>
  );
}
