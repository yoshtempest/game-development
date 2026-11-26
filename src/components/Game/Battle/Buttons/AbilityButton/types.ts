import { type ReactNode, type CSSProperties } from "react";

/** Tipos de comportamento do botão de habilidade. */
type AbilityButtonType =
  | "standard" // Habilidade padrão com cooldown (Atomic, GranReyCero, etc.)
  | "hold" // Habilidade de hold (KiCharge) - onPress/onRelease
  | "count" // Habilidade com contador (Portals) - count/max
  | "domain" // Expansão de Domínio - accent/background
  | "combo" // Ação de combo - sem cooldown, apenas visual
  | "custom"; // Totalmente customizado (usa classes do próprio botão)

export type Props = {
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
    /** Imagem de fundo do botão */
  image?: string;

  /** Posicionamento da imagem */
  imagePosition?: CSSProperties["backgroundPosition"];

  /** Dimensionamento da imagem */
  imageSize?: CSSProperties["backgroundSize"];
};