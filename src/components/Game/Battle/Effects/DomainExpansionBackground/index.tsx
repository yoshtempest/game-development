import styles from "./styles.module.css";

/** Um pedaço do vidro: recorte (`clip-path`) + deslocamento/giro do estilhaço. */
type Shard = {
  clip: string;
  x: string;
  y: string;
  rotate: string;
};

/**
 * Os 9 pedaços da quebra (grade 3×3 com cortes irregulares). Cada pedaço é um
 * `<span>` que carrega o MESMO `expansion.svg` e só recorta a sua fatia — assim
 * o vidro estilhaça mostrando os pedaços da imagem inteira, e não um borrão por
 * peça. Os deslocamentos são para fora do centro (o miolo quase parado e as
 * bordas voando mais longe), com giro alternado para não parecer uma grade.
 */
const SHARDS: Shard[] = [
  {
    clip: "polygon(0% 0%, 35% 3%, 33% 32%, 2% 34%)",
    x: "-9%",
    y: "-10%",
    rotate: "-6deg",
  },
  {
    clip: "polygon(35% 3%, 66% 1%, 68% 30%, 33% 32%)",
    x: "0%",
    y: "-12%",
    rotate: "4deg",
  },
  {
    clip: "polygon(66% 1%, 100% 0%, 98% 33%, 68% 30%)",
    x: "10%",
    y: "-9%",
    rotate: "7deg",
  },
  {
    clip: "polygon(2% 34%, 33% 32%, 35% 66%, 0% 68%)",
    x: "-11%",
    y: "0%",
    rotate: "5deg",
  },
  {
    clip: "polygon(33% 32%, 68% 30%, 67% 65%, 35% 66%)",
    x: "0%",
    y: "3%",
    rotate: "-2deg",
  },
  {
    clip: "polygon(68% 30%, 98% 33%, 100% 66%, 67% 65%)",
    x: "11%",
    y: "1%",
    rotate: "-5deg",
  },
  {
    clip: "polygon(0% 68%, 35% 66%, 33% 99%, 1% 100%)",
    x: "-8%",
    y: "10%",
    rotate: "5deg",
  },
  {
    clip: "polygon(35% 66%, 67% 65%, 69% 99%, 33% 99%)",
    x: "1%",
    y: "11%",
    rotate: "-4deg",
  },
  {
    clip: "polygon(67% 65%, 100% 66%, 99% 100%, 69% 99%)",
    x: "9%",
    y: "9%",
    rotate: "6deg",
  },
];

type Props = {
  active: boolean;
  /** `expansion.svg` do personagem (só quem tem `hasBackgroundArt`). */
  src: string | undefined;
  /**
   * Fase de quebra: algum inimigo sobreviveu ao domínio, então o vidro
   * estilhaça e desce para fora do campo de visão. Vale para todas as
   * Expansões de Domínio (`DOMAIN_SHATTER_MS`).
   */
  shattering: boolean;
};

/**
 * Preenchimento de domínio: o `expansion.svg` cobre o fundo da batalha,
 * surgindo "renderizado" de baixo para cima. No fim do domínio, quando algum
 * inimigo sobrevive, a imagem estilhaça em pedaços de vidro e o conjunto desce
 * e sai de cena, devolvendo o background normal da batalha.
 */
export function DomainExpansionBackground({ active, src, shattering }: Props) {
  if (!active || !src) return null;

  return (
    <div
      role="presentation"
      className={`${styles.overlay} ${shattering ? styles.shattering : ""}`}
      // Na quebra o elemento-base não desenha a imagem: só os pedaços a
      // desenham (senão a imagem intacta apareceria nas frestas).
      style={shattering ? undefined : { backgroundImage: `url(${src})` }}
    >
      {shattering &&
        SHARDS.map((shard, index) => (
          <span
            // Lista fixa e estática: o índice é a identidade do pedaço.
            key={index}
            className={styles.shard}
            style={
              {
                backgroundImage: `url(${src})`,
                clipPath: shard.clip,
                "--shard-x": shard.x,
                "--shard-y": shard.y,
                "--shard-rotate": shard.rotate,
              } as React.CSSProperties & Record<string, string>
            }
          />
        ))}
    </div>
  );
}
