import type { CharacterOption } from "@/utils/types/player/character";
import type { CharacterId } from "@/data/characters/list";

export const CHARACTERS: CharacterOption[] = [
  { name: "Marshadow", image: "marshadow", selectable: true },
  { name: "Drika", image: "drika", selectable: true },
  { name: "Samurion", image: "samurion", selectable: true },
  { name: "Sr. Guaxinim", image: "srGuaxinim", selectable: true },
  { name: "Ematron", image: "ematron", selectable: true },
  { name: "Laricell", image: "laricell", selectable: true },
  { name: "Y.R.A", image: "yra", selectable: true },
  { name: "Camy Kaze", image: "camyKaze", selectable: true },
  { name: "Yvel", image: "yvel", selectable: true },
  { name: "Babidi n.º 78==Dζ3", image: "babidi", selectable: true },
  { name: "Natsuki", image: "natsuki", selectable: true },
  { name: "Levi", image: "levi", selectable: true },
];

export function getCharacterName(id: CharacterId): string {
  return CHARACTERS.find((c) => c.image === id)?.name ?? id;
}
