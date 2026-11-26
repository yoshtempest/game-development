import type { CSSProperties } from "react";

import styles from "./styles.module.css";
import type { Props } from "./types"

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
  customClasses,
  renderExtra,
  extraProps,
  image,
  imagePosition = "center",
  imageSize = "cover",
}: Props) {
  const locked = disabled || (type === "standard" && !ready);

  // Helper para pegar classe customizada ou padrão
  const c = (key: keyof CustomAbilityClasses) =>
    customClasses?.[key] ?? styles[key];

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
    if (type === "count" && costText)
      return <span className={c("cost")}>{costText}</span>;
    if (type === "hold" && valueText)
      return <span className={c("value")}>{valueText}</span>;
    if (type === "hold" && costText)
      return <span className={c("cost")}>{costText}</span>;
    return null;
  };

  // Dynamic label for count type
  const charges = extraProps?.charges as number | undefined;

  // Dynamic label for count type

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

    ...(image && {
      backgroundImage: `url("${image}")`,
      backgroundSize: imageSize,
      backgroundPosition: imagePosition,
      backgroundRepeat: "no-repeat",
    }),

    ...(type === "domain" && {
      "--domain-accent": accent,
      ...(background && {
        backgroundImage: `url("${background}")`,
      }),
    }),
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
        <button className={c("button")} onPointerDown={onClick}>
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
      {charges && <span className={c("charges")}>{charges}x</span>}
      {renderCooldown()}
      {renderCost()}
      {renderExtra?.afterLabel}
      {renderExtra?.afterCooldown}
    </button>
  );
}
