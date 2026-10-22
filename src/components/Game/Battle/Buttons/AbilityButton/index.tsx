import { type ReactNode, type CSSProperties } from "react";

import styles from "./styles.module.css";

/** Tipos de comportamento do botão de habilidade. */
type AbilityButtonType =
  | "standard"          // Habilidade padrão com cooldown (Atomic, GranReyCero, etc.)
  | "hold"              // Habilidade de hold (KiCharge) - onPress/onRelease
  | "count"             // Habilidade com contador (Portals) - count/max
  | "domain"            // Expansão de Domínio - accent/background
  | "combo"             // Ação de combo - sem cooldown, apenas visual
  | "custom";           // Totalmente customizado (usa classes do próprio botão)

type AbilityButtonProps = {
  /** Tipo da habilidade - define o comportamento e layout. */
  type: AbilityButtonType;

  // Props padrão (standard, domain)
  ready?: boolean;
  remaining?: number;
  disabled?: boolean;
  onClick?: () => void;

  // Props para hold
  onPress?: () => void;
  onRelease?: () => void;

  // Props para count
  count?: number;
  maxCount?: number;
  cost?: number;

  // Props para domain
  name?: string;
  accent?: string;
  background?: string;

  // Props comuns
  /** Ícone (lucide-react component) */
  icon?: ReactNode;
  /** Texto do rótulo (ex: "I AM ATOMIC") */
  label?: string;
  /** Tooltip descritivo */
  title?: string;
  /** Classes CSS adicionais do botão (aplicadas ao botão) */
  className?: string;
  /** Estilos inline adicionais */
  style?: CSSProperties;
  /** Texto do cooldown customizado (se não usar remaining) */
  cooldownText?: string;
  /** Texto do custo customizado */
  costText?: string;
  /** Texto do valor (energia, etc.) */
  valueText?: string;
  /** Se mostra o badge de cooldown (standard) */
  showCooldown?: boolean;
  /** Se o botão está "cheio" (para count/hold) */
  full?: boolean;
  /** Texto customizado quando full (ex: "DESFAZER") */
  fullLabel?: string;
  /** Classes CSS customizadas do botão específico (sobrescrevem as internas) */
  customClasses?: CustomAbilityClasses;
  /** Elementos extras customizados (para casos especiais) */
  renderExtra?: {
    beforeLabel?: ReactNode;
    afterLabel?: ReactNode;
    afterCooldown?: ReactNode;
  };
  /** Props extras para casos especiais (ex: active, depleted, charges) */
  extraProps?: Record<string, unknown>;
};

/**
 * Botão base unificado para todas as habilidades de batalha.
 *
 * Tipos suportados:
 * - `standard`: Habilidade com cooldown (Atomic, GranReyCero, VastolordLaser, etc.)
 * - `hold`: Hold com pointer capture (KiCharge)
 * - `count`: Contador de usos (Portals)
 * - `domain`: Expansão de Domínio (accent + background)
 * - `combo`: Ação de combo (sem cooldown, apenas visual)
 * - `custom`: Totalmente customizado (usa classes do próprio botão)
 */
export function AbilityButton({
  type,
  ready = true,
  remaining = 0,
  disabled = false,
  onClick,
  onPress,
  onRelease,
  count = 0,
  maxCount = 1,
  name,
  accent,
  background,
  icon,
  label,
  title,
  className,
  style,
  cooldownText,
  costText,
  valueText,
  showCooldown = true,
  full = false,
  fullLabel,
  customClasses,
  renderExtra,
  extraProps,
}: AbilityButtonProps) {
  const locked = disabled || (type === "standard" && !ready);

  // Helper para pegar classe customizada ou padrão
  const c = (key: keyof CustomAbilityClasses) => customClasses?.[key] ?? styles[key];

  // Conteúdo do label
  const renderLabel = () => (
    <span className={`${c("abilityLabel")} ${c("label")}`}>
      {icon}
      {label ?? name?.toUpperCase()}
    </span>
  );

  // Cooldown badge
  const renderCooldown = () => {
    if (type !== "standard" || !showCooldown) return null;
    if (ready || remaining <= 0) return null;
    const text = cooldownText ?? `${remaining.toFixed(1)}s`;
    return <span className={c("cooldown")}>{text}</span>;
  };

  // Cost/value badge
  const renderCost = () => {
    if (type === "count" && costText) return <span className={c("cost")}>{costText}</span>;
    if (type === "hold" && valueText) return <span className={c("value")}>{valueText}</span>;
    if (type === "hold" && costText) return <span className={c("cost")}>{costText}</span>;
    return null;
  };

  // Dynamic label for count type
  const charges = extraProps?.charges as number | undefined;

  // Dynamic label for count type
  const displayLabel = type === "count" && full && fullLabel ? fullLabel : label;

  const baseClasses = [
    c("button"),
    type !== "combo" && "abilityButton",
    type === "standard" && ready ? c("ready") : "",
    type === "custom" && extraProps?.active ? c("active") : "",
    type === "custom" && extraProps?.depleted ? c("depleted") : "",
    full ? c("full") : "",
    locked ? "abilityDisabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inlineStyle: CSSProperties = {
    ...style,
    ...(type === "domain" && {
      "--domain-accent": accent,
      backgroundImage: background ? `url(${background})` : undefined,
    } as CSSProperties & Record<string, string>),
  };

  // Hold behavior (pointer capture)
  if (type === "hold") {
    return (
      <button
        className={baseClasses}
        disabled={locked}
        title={title}
        style={{ ...inlineStyle, touchAction: "none" }}
        onPointerDown={(e) => {
          if (locked) return;
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          onPress?.();
        }}
        onPointerUp={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
          onRelease?.();
        }}
        onPointerCancel={onRelease}
      >
        {valueText && <span className={c("value")}>{valueText}</span>}
        {renderLabel()}
        {renderCost()}
        {renderExtra?.beforeLabel}
      </button>
    );
  }

  // Combo type (different structure)
  if (type === "combo") {
    return (
      <div className={`$c("container") ${className ?? ""}`}>
        <button
          className={c("button")}
          onPointerDown={onClick}
        >
          {icon}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={baseClasses}
      onClick={onClick}
      disabled={locked}
      title={title}
      style={inlineStyle}
    >
      {renderExtra?.beforeLabel}
      {type === "count" && (
        <span className={c("count")}>
          {count}/{maxCount}
        </span>
      )}
      {charges && (
        <span className={c("charges")}>{charges}x</span>
      )}
      <span className={`${c("label")} ${c("abilityLabel")}`}>
        {displayLabel?.toUpperCase() ?? fullLabel}
      </span>
      {renderCooldown()}
      {renderCost()}
      {renderExtra?.afterLabel}
      {renderExtra?.afterCooldown}
    </button>
  );
}