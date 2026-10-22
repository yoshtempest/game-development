import { npcPath } from "@/utils/paths";
import { AbilityOverlay } from "@/components/Game/Battle/Effects/Ability/AbilityOverlay";

type Props = {
  active: boolean;
  npcType: string;
};

/**
 * Habilidade do alfa: mostra `alfa/background.svg` enquanto o alfa usa a
 * habilidade dele (ex: special dig do hungryDog). Mesma exibição do
 * SpecialIntro do jogador. Mesmo que a imagem falte, o caminho continua
 * sendo `<npcType>/alfa/background.svg`.
 */
export function AlfaAbility({ active, npcType }: Props) {
  return (
    <AbilityOverlay
      active={active}
      src={npcPath(`/${npcType}/alfa/background.svg`)}
    />
  );
}
