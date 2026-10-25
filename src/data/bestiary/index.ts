import { barragemData } from "./barragem";
import { bocainaData } from "./bocaina";
import { cachoeirasData } from "./cachoeiras";
import { jomasioData } from "./jomasio";
import { lagoaDoCantoData } from "./lagoaDoCanto";
import { lagoaGrandeData } from "./lagoaGrande";
import { tanqueDosCravosData } from "./tanqueDosCravos";

export const BESTIARY_DATA = {
  ...barragemData,
  ...bocainaData,
  ...cachoeirasData,
  ...jomasioData,
  ...lagoaDoCantoData,
  ...lagoaGrandeData,
  ...tanqueDosCravosData,
};

export const BESTIARY_NPC_ORDER: string[] = Object.keys(BESTIARY_DATA);
