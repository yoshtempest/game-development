import type { CharacterAbility } from "@/utils/types/player/abilities";
import styles from "@/components/Game/Navbar/ExploreNavbar/Character/AbilitiesList/styles.module.css";
import { getEnergyName } from "@/gameRules/battle/mana";
import { Clock, Coins, Sparkles } from "lucide-react";

function formatCooldown(cooldownMs: number) {
  return `${cooldownMs / 1000}s`;
}

export function AbilityMeta({
  ability,
  characterId,
}: {
  ability: CharacterAbility;
  characterId: CharacterId;
}) {
  const energyName = getEnergyName(characterId);

  if (ability.kind === "active") {
    return (
      <>
        {ability.cost !== undefined && (
          <span className={styles.meta}>
            <Coins size={12} /> {ability.cost} de {energyName}
          </span>
        )}
        {ability.cooldownMs !== undefined && (
          <span className={styles.meta}>
            <Clock size={12} /> Cooldown {formatCooldown(ability.cooldownMs)}
          </span>
        )}
        {ability.requires && (
          <span className={styles.meta}>
            <Sparkles size={12} /> {ability.requires}
          </span>
        )}
      </>
    );
  }

  return (
    <>
      <span className={styles.meta}>Nv. {ability.unlockedAtLevel}</span>
      {ability.oncePerBattle && (
        <span className={styles.meta}>1x por batalha</span>
      )}
    </>
  );
}
