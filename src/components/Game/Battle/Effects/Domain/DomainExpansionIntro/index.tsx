import { playerAbilityBackgroundPath } from "@/utils/paths";
import { AbilityOverlay } from "@/components/Game/Battle/Effects/Ability/AbilityOverlay";

type Props = {
  active: boolean;
  character: string | null;
  /** Pausa da batalha (menu aberto): congela a varredura no lugar. */
  paused?: boolean;
};

/**
 * Intro da Expansão de Domínio — a variante especial do `SpecialIntro`.
 * O domínio não abre com o fade-in centralizado das habilidades normais: o
 * `background.svg` varre a tela da esquerda pra direita crescendo, chega ao
 * centro, desacelera bem (onde cresce mais) e volta à velocidade normal
 * encolhendo um pouco até sair pela direita (`motion="sweep"` no overlay).
 */
export function DomainExpansionIntro({
  active,
  character,
  paused = false,
}: Props) {
  if (!active || !character) return null;

  return (
    <AbilityOverlay
      active={active}
      src={playerAbilityBackgroundPath(character, "domainExpansion")}
      motion="sweep"
      paused={paused}
    />
  );
}
