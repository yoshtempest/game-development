import { GenericAbilityButton } from "@/components/Game/Battle/Buttons/GenericAbilityButton";

type Props = {
  ready: boolean;
  remaining: number;
  disabled?: boolean;
  onClick: () => void;
};

/**
 * Botão da Explosão de Stacks (Larissa), agora delegado ao botão genérico: nome,
 * descrição e cooldown vêm do registro (`stackExplosionAbility` em
 * `data/characters/abilityFactories`), só o estado de cooldown fica aqui. O
 * rótulo mantém o curto "EXPLOSÃO" (a descrição completa é a tooltip).
 */
const STACK_EXPLOSION_ACCENT = "#f87171";
const STACK_EXPLOSION_LABEL = "EXPLOSÃO";

export function StackExplosionButton({
  ready,
  remaining,
  disabled = false,
  onClick,
}: Props) {
  return (
    <GenericAbilityButton
      characterId="larissa"
      abilityId="stackExplosion"
      behavior="standard"
      label={STACK_EXPLOSION_LABEL}
      accent={STACK_EXPLOSION_ACCENT}
      ready={ready}
      remaining={remaining}
      disabled={disabled}
      onClick={onClick}
    />
  );
}
