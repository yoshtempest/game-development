import type { CharacterAbility } from "@/utils/types/player/abilities";
import styles from "@/components/Game/Navbar/ExploreNavbar/Character/AbilitiesList/styles.module.css";
import { getEnergyName } from "@/gameRules/battle/mana";
import { Clock, Coins, Lock, Sparkles } from "lucide-react";

function formatCooldown(cooldownMs: number) {
  return `${cooldownMs / 1000}s`;
}

/**
 * Metadados do card de habilidade. O nível de desbloqueio vem pronto do pai
 * (`getAbilityUnlockLevel`) em vez de ser lido do dado aqui, porque para as
 * ativas o nível é derivado do slot — ler `ability.unlockedAtLevel` mostraria
 * vazio para quase todas.
 */
export function AbilityMeta({
  ability,
  characterId,
  unlockLevel,
  locked,
}: {
  ability: CharacterAbility;
  characterId: CharacterId;
  unlockLevel: number;
  locked: boolean;
}) {
  const energyName = getEnergyName(characterId);
  const levelLabel = (
    <span className={styles.meta}>
      {locked && <Lock size={12} />} Nv. {unlockLevel}
    </span>
  );

  if (ability.kind === "active") {
    return (
      <>
        {levelLabel}
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
      {levelLabel}
      {ability.oncePerBattle && (
        <span className={styles.meta}>1x por batalha</span>
      )}
    </>
  );
}
