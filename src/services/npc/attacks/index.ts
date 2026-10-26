import type { NpcType } from "@/data/npc";
import { NpcAttack } from "@/services/npc/npcAttack";
import { AinsAttack } from "./ains";
import { BaalAttack } from "./baal";
import { BaianoAttack } from "./baiano";
import { CrocodileAttack } from "./crocodile";
import { DeiseAttack } from "./deise";
import { DenisAttack } from "./denis";
import { DragonKingAttack } from "./dragonKing";
import { DummyAttack } from "./dummy";
import { DuqueAttack } from "./duque";
import { ElitCrocodileAttack } from "./elitCrocodile";
import { FigurantOfBaalCultAttack } from "./figurantOfBaalCult";
import { FigurantOfDragonKingCultAttack } from "./figurantOfDragonKingCult";
import { FigurantOfMobyDickCultAttack } from "./figurantOfMobyDickCult";
import { FischerAttack } from "./fischer";
import { GoatAttack } from "./goat";
import { HungryCowAttack } from "./hungryCow";
import { HungryDeathAttack } from "./hungryDeath";
import { HungryDogAttack } from "./hungryDog";
import { HungryFishAttack } from "./hungryFish";
import { HungryKingAttack } from "./hungryKing";
import { HungryPigAttack } from "./hungryPig";
import { JhowsimarAttack } from "./jhowsimar";
import { LeviathanAttack } from "./leviathan";
import { LupitaAttack } from "./lupita";
import { MadameAttack } from "./madame";
import { ManimAttack } from "./manim";
import { MaugreloAttack } from "./maugrelo";
import { MauraoAttack } from "./maurao";
import { MobyDickAttack } from "./mobyDick";
import { MuyMachoAttack } from "./muyMacho";
import { NecromancerAttack } from "./necromancer";
import { NeimitoAttack } from "./neimito";
import { PiupiuAttack } from "./piupiu";
import { PlanetarySistersAttack } from "./planetarySisters";
import { RiceAttack } from "./rice";
import { SlimitaAttack } from "./slimita";
import { SpiritMotocyclerAttack } from "./spiritMotocycler";
import { SrGuaxinimAttack } from "./srGuaxinim";
import { TechnobladeAttack } from "./technoblade";
import { TheBlackKnightAttack } from "./theBlackKnight";
import { TheChaosCreatorAttack } from "./theChaosCreator";
import { TheDevourerOfWorldsAttack } from "./theDevourerOfWorlds";
import { TheFirstNightmareAttack } from "./theFirstNightmare";
import { TheMasterPieceAttack } from "./theMasterPiece";
import { TheStrongestManUnderTheHeavensAttack } from "./theStrongestManUnderTheHeavens";
import { TimAttack } from "./tim";
import { TrueVandinhaAttack } from "./trueVandinha";
import { UntrackedMonsterAttack } from "./untrackedMonster";
import { VandinhaFragmentAttack } from "./vandinhaFragment";
import { YangKaiAttack } from "./yangKai";
import { OuroborosAttack } from "./ouroboros";

/**
 * Registry de ataques por NPC. `satisfies Record<NpcType, NpcAttack>` faz
 * qualquer NPC de `NPC_CLASSES` sem ataque registrado quebrar a compilação.
 *
 * Todo NPC novo precisa do próprio arquivo em `attacks/<npcType>.ts`
 * estendendo `NpcAttack` (ou `DefaultNpcAttack`) e de uma entrada aqui.
 */
export const npcAttacks = {
  /* Jomasio */
  hungryDeath: new HungryDeathAttack(),
  piupiu: new PiupiuAttack(),
  rice: new RiceAttack("rice"),
  jhowsimar: new JhowsimarAttack(),
  goat: new GoatAttack(),
  vandinhaFragment: new VandinhaFragmentAttack(),
  trueVandinha: new TrueVandinhaAttack("trueVandinha"),
  deise: new DeiseAttack(),
  necromancer: new NecromancerAttack("necromancer"),
  slimita: new SlimitaAttack(),
  hungryKing: new HungryKingAttack(),
  denis: new DenisAttack("denis"),
  srGuaxinim: new SrGuaxinimAttack(),
  neimito: new NeimitoAttack("neimito"),
  planetarySisters: new PlanetarySistersAttack("planetarySisters"),
  manim: new ManimAttack("manim"),
  maurao: new MauraoAttack(),
  maugrelo: new MaugreloAttack(),

  /* Bocaina */
  hungryDog: new HungryDogAttack(),
  lupita: new LupitaAttack("lupita"),
  duque: new DuqueAttack("duque"),
  baiano: new BaianoAttack("baiano"),
  spiritMotocycler: new SpiritMotocyclerAttack("spiritMotocycler"),
  tim: new TimAttack("tim"),
  muyMacho: new MuyMachoAttack("muyMacho"),

  /* Lagoa grande */
  hungryFish: new HungryFishAttack("hungryFish"),
  hungryCow: new HungryCowAttack("hungryCow"),
  fischer: new FischerAttack("fischer"),
  leviathan: new LeviathanAttack("leviathan"),

  /* Cachoeiras */
  figurantOfBaalCult: new FigurantOfBaalCultAttack("figurantOfBaalCult"),
  baal: new BaalAttack("baal"),
  madame: new MadameAttack("madame"),

  /* Barragem */
  figurantOfMobyDickCult: new FigurantOfMobyDickCultAttack(
    "figurantOfMobyDickCult",
  ),
  crocodile: new CrocodileAttack("crocodile"),
  elitCrocodile: new ElitCrocodileAttack("elitCrocodile"),
  mobyDick: new MobyDickAttack("mobyDick"),
  yangKai: new YangKaiAttack("yangKai"),

  /* Tanque dos crávos */
  figurantOfDragonKingCult: new FigurantOfDragonKingCultAttack(
    "figurantOfDragonKingCult",
  ),
  ains: new AinsAttack("ains"),
  dragonKing: new DragonKingAttack("dragonKing"),

  /* Lagoa do Canto */
  hungryPig: new HungryPigAttack("hungryPig"),
  technoblade: new TechnobladeAttack("technoblade"),

  /* Training */
  dummy: new DummyAttack(),

  /* Indefinido */
  theDevourerOfWorlds: new TheDevourerOfWorldsAttack("theDevourerOfWorlds"),
  theStrongestManUnderTheHeavens: new TheStrongestManUnderTheHeavensAttack(
    "theStrongestManUnderTheHeavens",
  ),
  theBlackKnight: new TheBlackKnightAttack("theBlackKnight"),
  untrackedMonster: new UntrackedMonsterAttack("untrackedMonster"),
  theMasterPiece: new TheMasterPieceAttack("theMasterPiece"),
  theChaosCreator: new TheChaosCreatorAttack("theChaosCreator"),
  theFirstNightmare: new TheFirstNightmareAttack("theFirstNightmare"),
  ouroboros: new OuroborosAttack("ouroboros"),
} satisfies Record<NpcType, NpcAttack>;

/**
 * Resolve o ataque de um NPC. Se o NPC não tiver ataque definido, lança
 * erro — batalha sem regra de ataque é bug de dados/registro.
 */
export function getNpcAttack(npcType: string): NpcAttack {
  const attack = npcAttacks[npcType as NpcType];

  if (!attack) {
    throw new Error(
      `[batalha] NPC "${npcType}" não tem ataque definido. Crie services/npc/attacks/${npcType}.ts e registre-o em attacks/index.ts.`,
    );
  }

  return attack;
}
