import { AbilityButton } from "@/components/Game/Battle/Buttons/AbilityButton";
import { npcPathProjectile } from "@/utils/paths";

type Props = {
  ready: boolean;
  remaining: number;
  disabled?: boolean;
  onClick: () => void;
};

/**
 * Botão da Killer Queen (SrGuaxinim), agora delegado ao botão genérico: nome,
 * descrição e cooldown vêm do registro (`killerQueenAbility` em
 * `data/characters/abilityFactories`), só o estado de cooldown fica aqui.
 * A cor é a identidade da habilidade (`--ability-aurora` do SrGuaxinim).
 */
const KILLER_QUEEN_ACCENT = "#fde68a";

export function KillerQueenButton({
  ready,
  remaining,
  disabled = false,
  onClick,
}: Props) {
  return (
    <AbilityButton
      type="standard"
      accent={KILLER_QUEEN_ACCENT}
      ready={ready}
      remaining={remaining}
      disabled={disabled}
      onClick={onClick}
      style={{
        backgroundImage:
          `url("${npcPathProjectile("/explosion.svg")}")`,
      }}
    />
  );
}
