import type { MarceloBattleForm } from "@/utils/paths";
import { playerAbilityBackgroundPath, playerPath } from "@/utils/paths";
import { AbilityOverlay } from "@/components/Game/Battle/Effects/Ability/AbilityOverlay";

type Props = {
  active: boolean;
  character: string | null;
  /** Habilidade com background próprio (ex: "atomic" → habilities/atomic/background.svg). */
  ability?: string | null;
  /**
   * Forma do personagem no momento do intro. Só importa quando há `ability`:
   * habilidades da Forma Vastolord (o laser) têm sprites em `vastolordForm/`.
   */
  form?: MarceloBattleForm | null;
  /** Pausa da batalha (menu aberto): congela a animação CSS no lugar. */
  paused?: boolean;
};

export function SpecialIntro({
  active,
  character,
  ability = null,
  form,
  paused = false,
}: Props) {
  if (!active || !character) return null;

  const backgroundSrc = ability
    ? playerAbilityBackgroundPath(character, ability, form ?? undefined)
    : playerPath(`/${character}/specialBackground.svg`);

  return <AbilityOverlay active={active} src={backgroundSrc} paused={paused} />;
}
