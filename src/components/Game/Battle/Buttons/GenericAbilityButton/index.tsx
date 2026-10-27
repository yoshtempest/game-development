import type { CSSProperties } from "react";

import { getActiveAbility } from "@/data/characters/abilities";
import type { CharacterId } from "@/data/characters/list";

import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";

import styles from "./styles.module.css";

type Props = {
  /** Dono da habilidade — o id sozinho não basta (`domainBurst` é compartilhado). */
  characterId: CharacterId;
  /** Id da ativa em `<char>/abilities.ts` (ex.: `killerQueen`, `blueSphere`). */
  abilityId: string;
  /** `standard` = clique com cooldown; `hold` = segurar/soltar com pointer capture. */
  behavior?: "standard" | "hold";
  /** Rótulo curto quando o nome do dado não cabe no botão (ex.: "EXPLOSÃO"). */
  label?: string;
  /** Cor da borda, rótulo e brilho. Ausente = accent do tema. */
  accent?: string;
  /** Arte de fundo opcional (path já resolvido por `asset()` no consumidor). */
  background?: string;
  ready?: boolean;
  remaining?: number;
  disabled?: boolean;
  /** `hold` cheio (ex.: Ki no máximo): pinta o botão de verde. */
  full?: boolean;
  /** Valor exibido no `hold` (energia atual). */
  energy?: number;
  onClick?: () => void;
  onPress?: () => void;
  onRelease?: () => void;
  className?: string;
};

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
}: Props) {
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
