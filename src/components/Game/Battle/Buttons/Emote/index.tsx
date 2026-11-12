import { PartyPopper } from "lucide-react";

import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";

import styles from "./styles.module.css";

type Props = {
  disabled?: boolean;
  onClick: () => void;
};

/**
 * Classes próprias do botão: o emote não tem cooldown nem custo, então o
 * visual é neutro para não competir com as habilidades de dano.
 */
const emoteClasses: CustomAbilityClasses = {
  button: styles.button,
  label: styles.label,
};

/**
 * Botão de emote/taunt: o personagem faz uma pose (sprites `idle2`/`idle3`)
 * sem causar dano. Só é renderizado para quem tem esses sprites.
 */
export function EmoteButton({ disabled = false, onClick }: Props) {
  return (
    <AbilityButton
      type="standard"
      customClasses={emoteClasses}
      icon={<PartyPopper size={18} />}
      label="Provocar"
      ready={!disabled}
      showCooldown={false}
      disabled={disabled}
      onClick={onClick}
      title="Provocar: o personagem faz uma pose sem causar dano. Qualquer outra ação interrompe."
    />
  );
}
