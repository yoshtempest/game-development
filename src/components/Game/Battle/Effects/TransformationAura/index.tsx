import styles from "./styles.module.css";

type Props = {
  /** Transformação do player ativa (hoje só a Forma Vastolord existe). */
  active: boolean;
  /** Pausa da batalha (menu aberto): congela o pulso no quadro atual. */
  paused: boolean;
};

/**
 * Energia piscando nas bordas da tela enquanto o personagem está transformado
 * (issue #258).
 *
 * É só CSS, sem imagem: um `box-shadow` inset com os tokens da Forma Vastolord,
 * então só as bordas brilham e o centro da cena, onde a luta acontece, fica
 * limpo. O pulso anima a opacidade (não o blur) para não repintar a sombra a
 * cada quadro durante toda a forma. `pointer-events: none` para não roubar o
 * toque dos controles.
 */
export function TransformationAura({ active, paused }: Props) {
  if (!active) return null;

  return (
    <div
      className={`${styles.aura} ${paused ? styles.paused : ""}`}
      role="presentation"
    />
  );
}
