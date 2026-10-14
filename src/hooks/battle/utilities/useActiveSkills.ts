import { useCallback, type RefObject } from "react";
import {
  BLINK_DISTANCE,
  BLINK_ENERGY_COST,
  CURSED_ENERGY_HEAL_RATIO,
  DIVERGENT_FIST_COST,
} from "@/gameRules/battle/cursedEnergy";

import { clampX } from "@/gameRules/movement/clampX";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import { gainAbilityCharge } from "@/gameRules/battle/special";
import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { SoundId } from "@/utils/audio/soundId";
import type { useBattleSystem } from "@/hooks/battle/main/useSystem";
import type { useBlinkAnimation } from "@/hooks/battle/player/characters/natsuki/useBlinkAnimation";

type Props = {
  cursedEnergyEnabled: boolean;
  battle: ReturnType<typeof useBattleSystem>;
  battleManaRef: RefObject<BattleManaApi | null>;
  player: Player;
  honoredOneActiveRef: RefObject<boolean>;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  triggerBlink: ReturnType<typeof useBlinkAnimation>["triggerBlink"];
  divergentFistActive: boolean;
  divergentFistRef: RefObject<boolean>;
  forcePunchRef: RefObject<boolean>;
  setDivergentFistActive: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useActiveSkills({
  cursedEnergyEnabled,
  battle,
  battleManaRef,
  player,
  honoredOneActiveRef,
  setPlayer,
  playSound,
  triggerBlink,
  divergentFistActive,
  divergentFistRef,
  forcePunchRef,
  setDivergentFistActive,
}: Props) {
  const handleCursedEnergyConversion = useCallback(() => {
    if (!cursedEnergyEnabled) return;
    const mana = battleManaRef.current;
    if (!mana || battle.isEnding.current) return;
    const maxHeal = battle.playerMaxHp - battle.playerHP;
    if (maxHeal <= 0) return;
    const heal = Math.min(
      Math.floor(mana.playerMana / CURSED_ENERGY_HEAL_RATIO),
      maxHeal,
    );
    if (heal <= 0) return;
    if (!mana.consumeMana(heal * CURSED_ENERGY_HEAL_RATIO)) return;
    battle.setPlayerHP((hp) => Math.min(battle.playerMaxHp, hp + heal));
    // Usar habilidade concede carga da Expansão de Domínio (custo da barra).
    battle.setDelicia((d) => gainAbilityCharge(d, battle.hitsToSpecial));
    playSound("drinkingPotion");
    if (player.character === "riquelme") {
      setPlayer((p) => ({ ...p, state: "heal" }));
    }
  }, [
    battleManaRef,
    battle,
    cursedEnergyEnabled,
    player.character,
    playSound,
    setPlayer,
  ]);

  // A Expansão de Domínio do riquelme (Muryōkūsho) segura o personagem na pose
  // `rioiki` até o fim do dreno (e da quebra do vidro): blink no meio dela seria
  // um teleporte para fora do domínio, então a habilidade morre junto.
  const riquelmeDomainActive = ALL_PREDICATES.isRiquelmeDomain(player.state);

  const handleBlink = useCallback(() => {
    if (riquelmeDomainActive) return;
    if (!honoredOneActiveRef.current) return;
    const mana = battleManaRef.current;
    if (!mana || battle.isEnding.current) return;
    if (mana.playerMana < BLINK_ENERGY_COST) return;
    if (!mana.consumeMana(BLINK_ENERGY_COST)) return;
    battle.setDelicia((d) => gainAbilityCharge(d, battle.hitsToSpecial));
    playSound("blink");
    const dir = player.battleDirection === "left" ? -1 : 1;
    const targetX = clampX(player.x + dir * BLINK_DISTANCE);
    triggerBlink(
      { x: player.x, y: player.y },
      { x: targetX, y: player.y },
      { direction: player.battleDirection, state: player.state },
      () => setPlayer((p) => ({ ...p, x: targetX })),
    );
  }, [
    battleManaRef,
    battle,
    honoredOneActiveRef,
    player.battleDirection,
    player.state,
    player.x,
    player.y,
    playSound,
    riquelmeDomainActive,
    setPlayer,
    triggerBlink,
  ]);

  const handleActivateDivergentFist = useCallback(() => {
    if (divergentFistActive) return;
    const mana = battleManaRef.current;
    if (!mana || battle.isEnding.current) return;
    if (mana.playerMana < DIVERGENT_FIST_COST) return;
    if (!mana.consumeMana(DIVERGENT_FIST_COST)) return;
    battle.setDelicia((d) => gainAbilityCharge(d, battle.hitsToSpecial));
    divergentFistRef.current = true;
    forcePunchRef.current = true;
    setDivergentFistActive(true);
    playSound("blink");
  }, [
    divergentFistActive,
    battleManaRef,
    battle,
    divergentFistRef,
    forcePunchRef,
    setDivergentFistActive,
    playSound,
  ]);

  return {
    handleCursedEnergyConversion,
    handleBlink,
    handleActivateDivergentFist,
  };
}
