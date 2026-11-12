import type { ComponentProps } from "react";
import type { Props as EntitiesProps } from "@/components/Game/Battle/Entities/types";
import type { BattleEntitiesBattle } from "@/components/Game/Battle/Entities/types";
import type { SpecialIntro } from "@/components/Game/Battle/Effects/SpecialIntro";
import type { ChargeParticles } from "@/components/Game/Battle/Effects/ChargeParticles";
import type { BabidiMachineGama } from "@/components/Game/Battle/Entities/Babidi/MachineGama";
import type { DamageNumbers } from "@/components/Game/Battle/Effects/DamageNumbers";

/**
 * Props do `BattleEntities` que são da cena local, não do jogador: NPC,
 * inimigos, loot, layout e callbacks (função não atravessa a rede).
 */
type LocalSceneKey =
  | "npc"
  | "battle"
  | "player"
  | "npcType"
  | "summons"
  | "coffins"
  | "lootBags"
  | "npcClass"
  | "TILE_SIZE"
  | "PLAYER_SIZE"
  | "isAlfa"
  | "killerQueenSprite"
  | "onBabidiShieldEnd"
  | "hideMainNpc"
  | "layer"
  | "npcBleeding"
  | "purpleHole"
  | "playerNameTag";

/** O que o `Player` da arena lê do jogador. */
export type RemotePlayerView = Pick<
  Player,
  "x" | "y" | "state" | "battleDirection" | "character" | "grabbedUntil"
>;

/**
 * Tudo que as habilidades de um jogador põem no mundo da arena (entidades,
 * feixes, projéteis, clones, aliados, pet, forma/arma do avatar). Derivado dos
 * próprios props do `BattleEntities`: efeito novo que entre lá já entra aqui.
 */
export type RemoteEntityVisuals = Omit<EntitiesProps, LocalSceneKey> & {
  player: RemotePlayerView;
  battle: Pick<BattleEntitiesBattle, "piercings" | "isExploding">;
  /** `killerQueenSprite(killerQueen.sprite)` já resolvido no remetente. */
  killerQueenSrc: string | null;
};

/** Efeitos de tela e os presos ao alvo/jogador fora do `BattleEntities`. */
export type RemoteSceneVisuals = {
  specialIntro: {
    active: boolean;
    character: string | null;
    ability: string | null;
    form: ComponentProps<typeof SpecialIntro>["form"];
  };
  domain: {
    burstActive: boolean;
    backgroundActive: boolean;
    shattering: boolean;
    art: string | null;
  };
  kokusen: { active: boolean; frame: string | null };
  divergentFistFrame: number | null;
  blackFlash: { active: boolean; variant: string | null };
  /** Alvo que o remetente via (NPC no co-op; o próprio receptor no PvP). */
  target: { x: number; y: number; height: number };
  sigilo: { pentagramVisible: boolean; selectedArmIcon: string | null };
  charge: Omit<ComponentProps<typeof ChargeParticles>, "playerX" | "playerY">;
  machineGama: ComponentProps<typeof BabidiMachineGama>["machineGama"];
  /** HP e nick do remetente: barra do parceiro no HUD do 2v1 (#548). */
  vitals: { hp: number; maxHp: number; name: string };
  /**
   * Números de dano do remetente (#549). Só no co-op: no PvP cada lado já vê
   * o dano que causa (sobre o proxy) e o que recebe, e repetir os do outro
   * duplicaria cada golpe na tela.
   */
  damageNumbers: ComponentProps<typeof DamageNumbers>["numbers"];
};

export type RemoteBattleVisuals = {
  entities: RemoteEntityVisuals;
  scene: RemoteSceneVisuals;
};
