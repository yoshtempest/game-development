import { useEffect } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useCharacterProgress } from "@/contexts/CharacterProgressContext";
import { MAX_HUNGER, getHungerMultiplier } from "@/data/player/hunger";
import { useTitles } from "@/contexts/TitleContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { getEquipmentStatsBonus } from "@/gameRules/battle/equipment";
import { getMaxMana } from "@/gameRules/battle/mana";
import { getRankMultiplier } from "@/gameRules/rank";
import { ONE_THOUSAND_MS } from "@/data/ms";
import { computeMaxHp } from "@/gameRules/battle/entities/player";

const REGEN_TICK_MS = ONE_THOUSAND_MS;

/**
 * Regenera o HP fora de batalha, um tick por segundo.
 *
 * O intervalo depende só de modo e personagem. `progress` ficou de fora
 * das dependências porque cada tick escreve `battleHP` — tê-lo ali fazia
 * o effect destruir e recriar o próprio intervalo a cada segundo. HP
 * atual, fome e teto de vida são relidos por ref dentro do tick, então o
 * cálculo continua acompanhando mudança de equipamento, título e fome
 * sem precisar reinstalar nada.
 */
export function useRegenTimer() {
  const { player } = usePlayer();
  const { progress, setBattleHP, setBattleMana } = useCharacterProgress();
  const { getBonus } = useTitles();

  const progressRef = useLatestRef(progress);
  const characterRef = useLatestRef(player.character);
  const setBattleHPRef = useLatestRef(setBattleHP);
  const setBattleManaRef = useLatestRef(setBattleMana);
  const getBonusRef = useLatestRef(getBonus);

  useEffect(() => {
    if (player.mode === "battle") return;

    const interval = setInterval(() => {
      const character = characterRef.current;
      const charProgress = progressRef.current[character];
      if (!charProgress) return;

      const currentMana = charProgress.battleMana;
      if (currentMana != null) {
        const maxMana = getMaxMana(character, charProgress.stats.spirit);
        if (currentMana >= maxMana) {
          setBattleManaRef.current(character, null);
        } else {
          setBattleManaRef.current(
            character,
            Math.min(maxMana, currentMana + 1),
          );
        }
      }

      const hp = charProgress.battleHP;
      if (hp == null) return;
      if (charProgress.hunger <= 0) return;

      const titleBonus = getBonusRef.current();
      const maxHp = computeMaxHp(
        charProgress.stats.resistance,
        getEquipmentStatsBonus(character).hp,
        titleBonus.hp,
        titleBonus.percentAllStats,
        getRankMultiplier(charProgress.level),
        getHungerMultiplier(charProgress.hunger),
      );

      if (hp >= maxHp) return;

      const healPerTick = (maxHp / 60) * (charProgress.hunger / MAX_HUNGER);
      const next = Math.min(maxHp, hp + healPerTick);

      setBattleHPRef.current(
        character,
        next >= maxHp ? null : Math.round(next),
      );
    }, REGEN_TICK_MS);

    return () => clearInterval(interval);
  }, [
    player.mode,
    characterRef,
    progressRef,
    setBattleHPRef,
    setBattleManaRef,
    getBonusRef,
  ]);
}
