import { formatTime } from "@/utils/formatDuration";
import type { DamageArmor } from "@/utils/types/battle/damageKind";

export type Stat = {
  label: string;
  value: React.ReactNode;
  progress?: number;
};

function stat(label: string, value: React.ReactNode, progress?: number): Stat {
  return { label, value, progress };
}

function progressStat(label: string, current: number, total: number): Stat {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return stat(label, `${current}/${total} (${percentage}%)`, percentage);
}

type SummaryStatsProps = {
  totalPlayTime: number;
  totalBattleTime: number;
  coins: number;
  hyperCoins: number;
  loginDays: number;
  totalKills: number;
  bestStreak: number;
  totalDeaths: number;
  damageDealt: number;
  damageTaken: number;
  blocks: number;
  hitsUsed: number;
  attacksUsed: number;
};

type CharacterStatsProps = {
  totalPlayTime: number;
  unlockedDate: string;
  totalBattleTime: number;
  coins: number;
  hyperCoins: number;
  totalKills: number;
  bestStreak: number;
  totalDeaths: number;
  damageDealt: number;
  damageTaken: number;
  blocks: number;
  hitsUsed: number;
  attacksUsed: number;
};

type ProgressStatsProps = {
  acquiredTitles: number;
  totalTitles: number;
  encounteredNpcs: number;
  totalNpcs: number;
  completedFlags: number;
  totalStoryFlags: number;
  maxLevelReached: number;
  completedSideQuests: number;
  totalSideQuests: number;
};

type CharacterStatusProps = {
  hp: number;
  strength: number;
  technique: number;
  spirit: number;
  resistance: number;
  tenacity: number;
  armor: DamageArmor;
  shield: number;
  vampirism: number;
  universalVampirism: number;
  reflect: number;
  maxHpDamageBonus?: number;
  trueDamage?: number;
};

type BattleRewardsProps = {
  myLevel: number;
  rank: string;
  xpReward: number;
  nextLevelXp: number;
  coinReward: number;
};

export function getSummaryStats(data: SummaryStatsProps) {
  return [
    stat("Tempo total", formatTime(data.totalPlayTime)),
    stat("Tempo em batalha", formatTime(data.totalBattleTime)),
    stat("Kwanzas", data.coins),
    stat("HyperCoins", data.hyperCoins),
    stat("Máx. vitórias consecutivas", data.bestStreak),
    stat("Total de inimigos derrotados", data.totalKills),
    stat("Total de derrotas", data.totalDeaths),
    stat("Dano total causado", data.damageDealt.toFixed(0)),
    stat("Dano total recebido", data.damageTaken.toFixed(0)),
    stat("Bloqueios", data.blocks),
    stat("Golpes usados", data.hitsUsed),
    stat("Ataques comuns", data.attacksUsed),
    stat("Dias Jogados", data.loginDays),
  ];
}

export function getCharacterStats(data: CharacterStatsProps) {
  return [
    stat("Tempo total", formatTime(data.totalPlayTime)),
    stat("Data de desbloqueio", data.unlockedDate),
    stat("Tempo em batalha", formatTime(data.totalBattleTime)),
    stat("Kwanzas", data.coins),
    stat("HyperCoins", data.hyperCoins),
    stat("Máx. vitórias consecutivas", data.bestStreak),
    stat("Total de inimigos derrotados", data.totalKills),
    stat("Total de derrotas", data.totalDeaths),
    stat("Dano total causado", data.damageDealt.toFixed(0)),
    stat("Dano total recebido", data.damageTaken.toFixed(0)),
    stat("Bloqueios", data.blocks),
    stat("Golpes usados", data.hitsUsed),
    stat("Ataques comuns", data.attacksUsed),
  ];
}

export function getProgressStat(data: ProgressStatsProps) {
  return [
    progressStat("Títulos", data.acquiredTitles, data.totalTitles),
    progressStat("NPCs encontrados", data.encounteredNpcs, data.totalNpcs),
    progressStat("História", data.completedFlags, data.totalStoryFlags),
    progressStat("Nível 100", data.maxLevelReached, 100),
    progressStat("Sidequests", data.completedSideQuests, data.totalSideQuests),
  ];
}

export function getCharacterStatus(data: CharacterStatusProps) {
  const stats = [
    stat("HP", data.hp),
    stat("Força", data.strength),
    stat("Técnica", data.technique),
    stat("Espírito", data.spirit),
    stat("Resistência", data.resistance),
    stat("Tenacidade", data.tenacity),
    stat("Armadura física", data.armor.physical),
    stat("Armadura mágica", data.armor.magical),
    stat("Escudo", data.shield),
    stat("Vampirismo", data.vampirism),
    stat("Vampirismo Universal", data.universalVampirism),
    stat("Reflexão", data.reflect),
  ];
  if (data.maxHpDamageBonus && data.maxHpDamageBonus > 0) {
    stats.push(stat("Dano HP", data.maxHpDamageBonus));
  }
  if (data.trueDamage && data.trueDamage > 0) {
    stats.push(stat("Dano Verdadeiro", data.trueDamage));
  }
  return stats;
}

export function getBattleRewards(data: BattleRewardsProps) {
  return [
    stat("Seu nível", data.myLevel),
    stat("Ranque", data.rank),
    stat("Xp Ganho", data.xpReward),
    stat("XP para o próximo nível", data.nextLevelXp),
    stat("Moedas", data.coinReward),
  ];
}
