import styles from "./styles.module.css";
import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";

type Props = {
  skillName: string;
  ready: boolean;
  remaining: number;
  cooldownMs: number;
  imageUrl?: string;
  disabled?: boolean;
  onClick: () => void;
};

/**
 * Botão de habilidade de pet (genérico).
 * type="standard" com customClasses para skillName.
 */
const petSkillClasses: CustomAbilityClasses = {
  button: styles.button,
  ready: styles.ready,
  cooldown: styles.cooldown,
  skillName: styles.skillName,
};

export function PetSkillButton({
  skillName,
  ready,
  remaining,
  imageUrl,
  disabled = false,
  onClick,
}: Props) {
  return (
    <AbilityButton
      type="standard"
      customClasses={petSkillClasses}
      label={skillName}
      ready={ready}
      remaining={remaining}
      disabled={disabled}
      onClick={onClick}
      style={{
        backgroundImage: imageUrl ? `url("${imageUrl}")` : undefined,
        backgroundSize: imageUrl ? "cover" : undefined,
        backgroundPosition: imageUrl ? "center" : undefined,
      }}
      renderExtra={{
        beforeLabel: (
          <span className={styles.skillName}>
            {ready ? skillName : remaining > 0 ? "" : ""}
          </span>
        ),
      }}
    />
  );
}
