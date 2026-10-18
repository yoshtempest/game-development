import { getEquipmentBySlotAndRank } from "@/data/equipment";
import { rollEnhance } from "./rollEnhance";
import { rollSlotDrop } from "@/data/equipment/drops";

export function rollEquipmentDrops(
  npcClass: NPCClass,
  addDrop: (character: CharacterId, id: EquipmentId, enhance?: number) => void,
  character: CharacterId,
  luckBonus: number,
): EquipmentDropInfo[] {
  const drops: EquipmentDropInfo[] = [];
  const slots: EquipmentSlot[] = [
    "weapon",
    "helmet",
    "chestplate",
    "pants",
    "boots",
    "accessory",
    "bag",
  ];

  for (const slot of slots) {
    const rank = rollSlotDrop(npcClass, luckBonus);
    // `rank === null` explícito: um `!rank` genérico engoliria o rank 0
    // (Transcendente), que é um rank válido e não um nulo.
    if (rank === null) continue;
    // Rank 0 (Transcendente) e EX são exclusivos de baús lendários+ — a
    // tabela de batalha já zera o peso deles, isto é a trava de redundância.
    // O gate antigo era `rank >= 9`: bloqueava rank 9 (tinha peso na tabela)
    // e deixava rank 0 passar até o `!rank` falso-o matar.
    if (rank === "EX" || rank === 0) continue;

    const candidates = getEquipmentBySlotAndRank(slot, rank).filter(
      (e) => !e.craftOnly,
    );
    if (candidates.length === 0) continue;

    const equipment =
      candidates[Math.floor(Math.random() * candidates.length)]!;
    const enhance = rollEnhance();
    addDrop(character, equipment.id, enhance);
    drops.push({
      id: equipment.id,
      name: equipment.name,
      slot: equipment.slot,
      rank: equipment.rank,
      enhance,
    });
  }

  return drops;
}
