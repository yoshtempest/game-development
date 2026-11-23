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
import { SITTING_HEAL_PER_SECOND } from "@/data/player/emotes";

const REGEN_TICK_MS = ONE_THOUSAND_MS;

/**
 * `statsResistance` alimenta a vida desde que HP virou stat derivado dela — o
 * parametro foi renomeado junto para o nome não mentir sobre a origem do valor.
 */
function computeMaxHp(
  statsResistance: number,
  equipmentHp: number,
  titleHp: number,
  titleAllStatsPct: number,
  rankMultiplier: number,
  hungerMultiplier: number,
): number {
  const allStatsPct = 1 + titleAllStatsPct / 100;
  const effectiveHp =
    (statsResistance + equipmentHp + titleHp) *
    allStatsPct *
    rankMultiplier *
    hungerMultiplier;
  return 90 + Math.round(effectiveHp) * 10;
}

/**
 * Regenera o HP fora de batalha, um tick por segundo.
 *
 * O intervalo depende só de modo e personagem. `progress` ficou de fora
 * das dependências porque cada tick escreve `battleHP` — tê-lo ali fazia
 * o effect destruir e recriar o próprio intervalo a cada segundo. HP
 * atual, fome e teto de vida são relidos por ref dentro do tick, então o
 * cálculo continua acompanhando mudança de equipamento, título e fome
 * sem precisar reinstalar nada.
 *
 * Sentado (`player.emote === "sitting"`) soma `SITTING_HEAL_PER_SECOND` ao
 * tick e cura mesmo com fome zerada — descansar é justamente a saída de quem
 * está sem comida. A pose é lida por ref pelo mesmo motivo do `progress`:
 * sentar/levantar não pode reiniciar o intervalo.
 */
export function useRegenTimer() {
  const { player } = usePlayer();
  const { progress, setBattleHP, setBattleMana } = useCharacterProgress();
  const { getBonus } = useTitles();

  const progressRef = useLatestRef(progress);
  const characterRef = useLatestRef(player.character);
  const emoteRef = useLatestRef(player.emote);
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
      const sittingHeal =
        emoteRef.current === "sitting" ? SITTING_HEAL_PER_SECOND : 0;
      if (charProgress.hunger <= 0 && sittingHeal === 0) return;

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

      const healPerTick =
        (maxHp / 60) * (Math.max(0, charProgress.hunger) / MAX_HUNGER) +
        sittingHeal;
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
    emoteRef,
    progressRef,
    setBattleHPRef,
    setBattleManaRef,
    getBonusRef,
  ]);
}
