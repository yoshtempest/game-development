import styles from "./styles.module.css";
import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";

type Props = {
  /** Nome do domínio do personagem (rótulo e tooltip). */
  name: string;
  description: string;
  /** Cor do efeito (borda, rótulo e brilho), vinda de `DOMAIN_EXPANSIONS`. */
  accent: string;
  /** Fundo da arte da habilidade — só o marshadow tem; os demais usam o accent. */
  background?: string;
  ready: boolean;
  disabled?: boolean;
  onClick: () => void;
};

/**
 * Botão da Expansão de Domínio: presente para TODOS os personagens, porque a
 * barra de cargas é universal. O marshadow roda o mugetsu bespoke (com a arte
 * `habilities/domainExpansion/background.svg`); os demais rodam o burst
 * universal (`kind: "burst"`), todos com nome/cor de `DOMAIN_EXPANSIONS`.
 */
const domainClasses: CustomAbilityClasses = {
  button: styles.button,
  label: styles.label,
  ready: styles.ready,
};

export function DomainExpansionButton({
  name,
  description,
  accent,
  background,
  ready,
  disabled = false,
  onClick,
}: Props) {
  return (
    <AbilityButton
      type="domain"
      customClasses={domainClasses}
      label={name}
      name={name}
      accent={accent}
      background={background}
      ready={ready}
      disabled={disabled}
      onClick={onClick}
      title={`${name}: ${description}`}
    />
  );
}
