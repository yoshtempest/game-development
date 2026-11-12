import { playerPathMarshadowHabilities } from "@/utils/paths";

import { GenericAbilityButton } from "@/components/Game/Battle/Buttons/GenericAbilityButton";

type Props = {
  ready: boolean;
  remaining: number;
  disabled?: boolean;
  onClick: () => void;
};

/** Cor da liberação (preto/vermelho do Tensa Zangetsu). */
const BANKAI_ACCENT = "#b91c1c";

/**
 * Botão da Bankai do marshadow. Nome, descrição e cooldown vêm do registro
 * (`getActiveAbility`). O fundo aponta para `habilities/bankai/background.svg`;
 * enquanto a arte não existir, o `background-image` simplesmente não carrega e
 * o botão fica com a cor do `accent` — sem quebrar o render.
 */
export function BankaiButton({
  ready,
  remaining,
  disabled = false,
  onClick,
}: Props) {
  return (
    <GenericAbilityButton
      characterId="marshadow"
      abilityId="bankai"
      label="BANKAI"
      accent={BANKAI_ACCENT}
      background={playerPathMarshadowHabilities("bankai/background.svg")}
      ready={ready}
      remaining={remaining}
      disabled={disabled}
      onClick={onClick}
    />
  );
}
