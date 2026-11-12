import { useComboSystem } from "@/hooks/battle/effects/useComboSystem";
import { useStatCallbacks } from "@/hooks/battle/effects/statCallbacks/useStatCallbacks";
import { useActiveSkills } from "@/hooks/battle/utilities/activeSkills/useActiveSkills";
import { usePlayerBattleActions } from "@/hooks/battle/player/playerActions/usePlayerActions";
import { useChargeAttack } from "@/hooks/battle/charge/attack/useAttack";
import { getBabidiAttackMode } from "@/utils/character/babidiAttackMode";
import { clampX } from "@/gameRules/movement/clampX";

import type { BattleCombatActionsProps } from "./types";

/**
 * Ações de combate (`useBattleCombatActions`): o que o player faz quando age
 * (básico, special, charge e combo) e o que a batalha conta (bloqueio, dano
 * tomado, esquiva e acertos).
 *
 * O `useBattleSystem` (que fica no core) consome os callbacks de estatística
 * pelo bag compartilhado: as refs precisam existir no primeiro render, mas
 * quem sabe das stats é este hook — montado depois do core.
 */
export function useBattleCombatActions({
  battle,
  refs,
  npc,
  player,
  setPlayer,
  playerClass,
  npcType,
  npcClass,
  npcLevel,
  progress,
  weapon,
  equipYvelWeapon,
  summons,
  setSummons,
  giveSummonRewards,
  setPlayerState,
  ematronComboMultiplierRef,
  ematronComboActiveRef,
  ematronComboAirActiveRef,
  ematronComboStepIndexRef,
  forcePunchRef,
  babidiFireRef,
  babidiOnHitRef,
  babidiMissileFireRef,
  babidiMissileOnHitRef,
  vastolordMultiplierRef,
  cursedEnergyEnabled,
  battleManaRef,
  honoredOneActiveRef,
  playSound,
  triggerBlink,
  divergentFistActive,
  divergentFistRef,
  setDivergentFistActive,
  incrementBlockCounter,
  incrementDamageTaken,
  incrementDodgeCounter,
  incrementDamageDealt,
  babidiShield,
}: BattleCombatActionsProps) {
  // ── Combo ─────────────────────────────────────────────────────────────────
  const {
    comboCount,
    comboRank,
    progress: comboProgress,
    nextRank,
    registerHit,
    resetCombo,
  } = useComboSystem({ npcMaxHp: battle.npcMaxHp });

  // ── Habilidades ativas ────────────────────────────────────────────────────
  const {
    handleCursedEnergyConversion,
    handleBlink,
    handleActivateDivergentFist,
  } = useActiveSkills({
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
  });

  // ── Golpes do player ──────────────────────────────────────────────────────
  const { handlePlayerHit, handleSpecialHit, handleExtraPunch, hitTargetList } =
    usePlayerBattleActions({
      player,
      npc,
      summons,
      setSummons,
      npcHP: battle.npcHP,
      npcClass,
      playerClass,
      weapon,
      progress,
      npcLevel,
      battle,
      giveSummonRewards,
      spawnDamageRef: refs.spawnDamageRef,
      registerHitRef: refs.registerHitRef,
      setPlayerHP: battle.setPlayerHP,
      playerHP: battle.playerHP,
      playerMaxHp: battle.playerMaxHp,
      vampirism: battle.vampirism,
      onNpcPush: (targetX) =>
        npc.updateNpc({
          x: clampX(targetX),
        }),
      onComboAdvance: (forwardDistance, targetX) =>
        setPlayer((p) => {
          if (p.mode !== "battle" || forwardDistance <= 0) return p;
          const direction = targetX >= p.x ? 1 : -1;
          const stepToX = clampX(p.x + direction * forwardDistance);
          const toX =
            direction === 1
              ? Math.min(stepToX, targetX)
              : Math.max(stepToX, targetX);
          if (toX === p.x) return p;
          return {
            ...p,
            pullFromX: p.x,
            pullToX: toX,
            pullStartTime: Date.now(),
          };
        }),
      ematronComboMultiplierRef,
      ematronComboActiveRef,
      ematronComboAirActiveRef,
      ematronComboStepIndexRef,
      babidiFireRef,
      babidiOnHitRef,
      babidiMissileFireRef,
      babidiMissileOnHitRef,
      babidiAttackMode: getBabidiAttackMode(),
    });

  // ── Charge ────────────────────────────────────────────────────────────────
  const charge = useChargeAttack({
    player,
    setPlayer,
    npcX: npc.x,
    npcY: npc.y,
    npcType,
    npcArmor: battle.npcArmor,
    npcClass,
    char: battle.char,
    playerClass,
    critRate: battle.critRate,
    titleDamageBonus: battle.titleDamageBonus,
    elementDamageBonus: battle.elementDamageBonus,
    setNpcHP: battle.setNpcHP,
    playerCooldown: battle.playerCooldown,
    isEnding: battle.isEnding,
    timeRef: refs.timeRef,
    spawnDamageRef: refs.spawnDamageRef,
    registerHitRef: refs.registerHitRef,
    setPlayerState,
    summons,
    setSummons,
    setDelicia: battle.setDelicia,
    hitsToSpecial: battle.hitsToSpecial,
    setPlayerHP: battle.setPlayerHP,
    playerHP: battle.playerHP,
    playerMaxHp: battle.playerMaxHp,
    vampirism: battle.vampirism,
    weapon,
    equipWeapon: equipYvelWeapon,
    vastolordMultiplierRef,
  });

  // ── Estatísticas da batalha ───────────────────────────────────────────────
  const statCallbacks = useStatCallbacks({
    playerCharacter: player.character,
    incrementBlockCounter,
    incrementDamageTaken,
    incrementDodgeCounter,
    incrementDamageDealt,
    onBlockSide: babidiShield.register,
  });

  refs.onBlockRef.current = statCallbacks.onBlockRef.current;
  refs.onDamageTakenRef.current = statCallbacks.onDamageTakenRef.current;
  refs.onDodgeRef.current = statCallbacks.onDodgeRef.current;
  refs.onDamageDealtRef.current = statCallbacks.onDamageDealtRef.current;
  refs.onAttackRef.current = statCallbacks.onAttackRef.current;
  refs.onSpecialRef.current = statCallbacks.onSpecialRef.current;

  return {
    comboCount,
    comboRank,
    comboProgress,
    nextRank,
    registerHit,
    resetCombo,
    handleCursedEnergyConversion,
    handleBlink,
    handleActivateDivergentFist,
    handlePlayerHit,
    handleSpecialHit,
    handleExtraPunch,
    hitTargetList,
    charge,
  };
}
