import type { Props } from "./types";
import { useMemo } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useCharacterProgress } from "@/contexts/CharacterProgressContext";
import { useTitles } from "@/contexts/TitleContext";
import { useEquipment } from "@/contexts/EquipmentContext";
import {
  getEquipmentStatsBonus,
  getWeaponCritRate,
  getTotalArmor,
} from "@/gameRules/battle/equipment";
import { getTenacityReduction } from "@/gameRules/battle/tenacity";
import { addArmor, scaleArmor } from "@/gameRules/battle/damage/armor";
import type { VampirismStats } from "@/gameRules/battle/vampirism/applyVampirism";
import { getNpcStats } from "@/gameRules/npc/npcStats";
import { getMaxSpecial } from "@/gameRules/battle/special";
import { getRankMultiplier } from "@/gameRules/rank";
import { combatService } from "@/services/combat";
import type { DamageArmor } from "@/utils/types/battle/damageKind";
import { buildCharacterStats } from "../buildCharacterStats";



/**
 * Consolida os stats usados na batalha: personagem, equipamento, título,
 * ranque e os stats do NPC.
 *
 * A leitura de equipamento é um memo só, dependente de
 * `equipmentRevision`. `getEquipmentStatsBonus` e companhia vão ao
 * storage por dentro em vez de ler o estado do contexto, então o
 * exhaustive-deps não enxerga essa dependência — daí o token explícito e
 * o disable. Sem ele nada invalidava, e equipar ou desequipar sem trocar
 * de personagem deixava a batalha rodando com os stats antigos.
 *
 * Escudo, vampirismo e reflexo saem do mesmo `bonus`: `getTotalShield` e
 * companhia recarregavam o storage para recalcular número idêntico.
 */
export function useBattleStats({
  npcType,
  npcLevel,
  npcClass,
  difficulty,
  npcPhase,
  npcStatMultiplier = 1,
  npcArmorBonus = 0,
}: Props) {
  const { player, playerClass } = usePlayer();
  const { progress } = useCharacterProgress();
  const { getBonus, getElementDamageBonus } = useTitles();
  const { getEquippedItem, equipmentRevision } = useEquipment();

  const baseChar = progress[player.character];

  const equipment = useMemo(
    () => ({
      bonus: getEquipmentStatsBonus(player.character),
      weaponCritRate: getWeaponCritRate(player.character),
      armor: getTotalArmor(player.character, baseChar.stats.resistance),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [player.character, baseChar.stats.resistance, equipmentRevision],
  );

  const equipmentBonus = equipment.bonus;
  const weaponCritRate = equipment.weaponCritRate;

  const titleBonus = useMemo(() => {
    return getBonus();
  }, [getBonus]);

  const totalArmor = useMemo(
    () =>
      addArmor(equipment.armor, {
        physical: titleBonus.armor,
        magical: titleBonus.armor,
      }),
    [equipment.armor, titleBonus.armor],
  );
  const totalShield = equipmentBonus.shield + titleBonus.shield;
  // Os dois modelos andam juntos: um stat novo sem o outro quebrar na
  // hora de aplicar é pior que os dois na mesma struct.
  const vampirism = useMemo<VampirismStats>(
    () => ({
      vampirism: equipmentBonus.vampirism,
      universalVampirism: equipmentBonus.universalVampirism,
    }),
    [equipmentBonus.vampirism, equipmentBonus.universalVampirism],
  );
  const totalReflect = equipmentBonus.reflect;

  const totalMaxHpDamage = useMemo(() => {
    return equipmentBonus.maxHpDamage ?? 0;
  }, [equipmentBonus.maxHpDamage]);

  const totalTrueDamage = useMemo(() => {
    return equipmentBonus.trueDamage ?? 0;
  }, [equipmentBonus.trueDamage]);

  const totalTenacity = useMemo(() => {
    return baseChar.stats.tenacity + (equipmentBonus.tenacity ?? 0);
  }, [baseChar.stats.tenacity, equipmentBonus.tenacity]);

  const tenacityReduction = useMemo(() => {
    return getTenacityReduction(totalTenacity);
  }, [totalTenacity]);

  const totalLuck = useMemo(() => {
    return baseChar.stats.luck + (equipmentBonus.luck ?? 0);
  }, [baseChar.stats.luck, equipmentBonus.luck]);

  const luckBonus = useMemo(() => {
    return combatService.getLuckBonus(totalLuck);
  }, [totalLuck]);

  const critRate = 1 + weaponCritRate + luckBonus * 100;

  const rankMultiplier = useMemo(() => {
    return getRankMultiplier(baseChar?.level ?? 1);
  }, [baseChar]);

  const char = useMemo(
    () =>
      buildCharacterStats(baseChar, equipmentBonus, titleBonus, rankMultiplier),
    [baseChar, equipmentBonus, titleBonus, rankMultiplier],
  );

  const playerMaxHp = useMemo(() => {
    return 90 + char.stats.hp * 10;
  }, [char.stats.hp]);

  const npcMaxHp = useMemo(() => {
    return getNpcStats(
      npcLevel,
      npcClass,
      difficulty,
      npcStatMultiplier,
      npcType,
    ).hp;
  }, [npcLevel, npcClass, difficulty, npcStatMultiplier, npcType]);

  const npcArmor = useMemo<DamageArmor>(() => {
    const stats = getNpcStats(
      npcLevel,
      npcClass,
      difficulty,
      npcStatMultiplier,
      npcType,
    );
    // A fase 2 engrossa o boss nas duas colunas; o buff de armadura do goat
    // também, senão ele protegeria só de um tipo de golpe.
    const phaseArmor = scaleArmor(stats.armor, npcPhase === 2 ? 1.5 : 1);
    return addArmor(phaseArmor, {
      physical: npcArmorBonus,
      magical: npcArmorBonus,
    });
  }, [
    npcType,
    npcLevel,
    npcClass,
    difficulty,
    npcPhase,
    npcStatMultiplier,
    npcArmorBonus,
  ]);

  const HITS_TO_SPECIAL = getMaxSpecial();

  const hasPet = getEquippedItem(player.character, "pet") !== null;

  const equippedWeaponId =
    getEquippedItem(player.character, "weapon")?.id ?? null;

  return {
    player,
    playerClass,
    baseChar,
    char,
    equipmentBonus,
    critRate,
    totalArmor,
    totalShield,
    vampirism,
    totalReflect,
    totalMaxHpDamage,
    totalTrueDamage,
    totalTenacity,
    tenacityReduction,
    totalLuck,
    luckBonus,
    titleBonus,
    getElementDamageBonus,
    playerMaxHp,
    npcMaxHp,
    npcArmor,
    HITS_TO_SPECIAL,
    hasPet,
    equippedWeaponId,
  };
}
