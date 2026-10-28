import styles from "./styles.module.css";

type Props = {
  active: boolean;
  /** Nome do domínio do personagem (ex.: "Campo Fulminante"). */
  name: string;
  /** Cor do efeito, vinda de `DOMAIN_EXPANSIONS`. */
  accent: string;
  /** Pausa da batalha (menu aberto): congela o flash no lugar. */
  paused?: boolean;
};

/**
 * Flash visual do burst da Expansão de Domínio universal: tinge a arena com o
 * accent do personagem e estampa o nome do domínio no centro enquanto o dano
 * varre a arena (~900ms). Só o marshadow não usa — ele tem o mugetsu e o
 * `DomainExpansionBackground`.
 */
export function DomainBurstOverlay({
  active,
  name,
  accent,
  paused = false,
}: Props) {
  if (!active) return null;

  return (
    <div
      className={`${styles.overlay} ${paused ? styles.paused : ""}`}
      style={
        { "--domain-accent": accent } as React.CSSProperties &
          Record<string, string>
      }
    >
      <span className={styles.name}>{name}</span>
    </div>
  );
}
