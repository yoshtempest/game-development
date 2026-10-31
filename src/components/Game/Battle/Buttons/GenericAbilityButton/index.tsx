import type { CSSProperties } from "react";

import { getActiveAbility } from "@/data/characters/abilities";

import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";

import styles from "./styles.module.css";
import type { GenericButtonProps } from "./types";

/**
 * Botão genérico de habilidade ativa: nome, descrição e custo vêm do registro
 * (`getActiveAbility`), então a tooltip e o rótulo nunca divergem do que a
 * battle e o menu de Status mostram.
 *
 * O que continua vindo do consumidor é só o estado da batalha (`ready`,
 * `remaining`, `energy`, `disabled`) e a identidade visual (`accent`,
 * `background`). Casos com coreografia própria de botão (contador de portais,
 * cargas do Vastolord, junção das esferas) continuam com componente próprio.
 */
const genericClasses: CustomAbilityClasses = {
  button: styles.button,
  label: styles.label,
  ready: styles.ready,
  cooldown: styles.cooldown,
  value: styles.value,
  cost: styles.cost,
};

export function GenericAbilityButton({
  characterId,
  abilityId,
  behavior = "standard",
  label,
  accent,
  background,
  ready = true,
  remaining = 0,
  disabled = false,
  full = false,
  energy,
  onClick,
  onPress,
  onRelease,
  className,
}: GenericButtonProps) {
  const ability = getActiveAbility(characterId, abilityId);
  // Habilidade não registrada é erro de dado, não de render: sem botão é o
  // mesmo comportamento de um personagem sem ativa, e o import que faltou
  // aparece no type-check de quem consome o registro.
  if (!ability) return null;

  const style = {
    ...(accent ? { "--ability-accent": accent } : {}),
    backgroundImage: background ? `url(${background})` : undefined,
  } as CSSProperties & Record<string, string>;

  return (
    <AbilityButton
      type={behavior}
      customClasses={genericClasses}
      className={className}
      label={label ?? ability.name}
      // `AbilityButton` só mostra custo em `hold`; nas padrão o custo fica na
      // descrição da tooltip.
      costText={
        behavior === "hold" && ability.cost != null
          ? `-${ability.cost}`
          : undefined
      }
      valueText={
        behavior === "hold" && energy != null
          ? `${Math.round(energy)}`
          : undefined
      }
      ready={ready}
      remaining={remaining}
      disabled={disabled}
      full={full}
      onClick={onClick}
      onPress={onPress}
      onRelease={onRelease}
      title={`${ability.name}: ${ability.description}`}
      style={style}
    />
  );
}
