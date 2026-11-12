import { BattleEntities } from "@/components/Game/Battle/Entities";
import { SpecialIntro } from "@/components/Game/Battle/Effects/SpecialIntro";
import { DomainExpansionIntro } from "@/components/Game/Battle/Effects/Domain/DomainExpansionIntro";
import { DomainExpansionBackground } from "@/components/Game/Battle/Effects/Domain/DomainExpansionBackground";
import { DomainBurstOverlay } from "@/components/Game/Battle/Effects/Domain/DomainBurstOverlay";
import { ChargeParticles } from "@/components/Game/Battle/Effects/ChargeParticles";
import { DrikaSigiloOverlay } from "@/components/Game/Battle/Overlay/DrikaSigilo";
import { KokusenAnimation } from "@/components/Game/Battle/Effects/Natsuki/KokusenAnimation";
import { DivergentFistAnimation } from "@/components/Game/Battle/Effects/Natsuki/DivergentFistAnimation";
import { BlackFlashAnimation } from "@/components/Game/Battle/Effects/Natsuki/BlackFlashAnimation";
import { BabidiMachineGama } from "@/components/Game/Battle/Entities/Babidi/MachineGama";
import { DOMAIN_EXPANSIONS } from "@/data/characters/domainExpansions";
import { CHARACTERS, type CharacterId } from "@/data/characters/list";
import type { MainNpcState } from "@/components/Game/Battle/Entities/types";
import type { RemoteBattleVisuals } from "./types";

function asCharacterId(value: string): CharacterId | null {
  return CHARACTERS.find((c) => c === value) ?? null;
}

type BackgroundProps = {
  visuals: RemoteBattleVisuals | null;
  /** Domínio local já pinta o fundo: dois fundos de domínio não se somam. */
  localActive: boolean;
  paused: boolean;
};

/**
 * Preenchimento do domínio do outro jogador. Vai logo depois do fundo local
 * no `.Master` (mesma camada), para ficar abaixo de HUD, mapa e entidades.
 */
export function RemoteDomainBackground({
  visuals,
  localActive,
  paused,
}: BackgroundProps) {
  if (!visuals || localActive) return null;
  const { domain } = visuals.scene;
  return (
    <DomainExpansionBackground
      active={domain.backgroundActive}
      src={domain.art ?? undefined}
      shattering={domain.shattering}
      paused={paused}
    />
  );
}

type OverlayProps = {
  visuals: RemoteBattleVisuals | null;
  paused: boolean;
};

/**
 * Efeitos de tela das habilidades do outro jogador: intro do special, intro
 * e burst do domínio e a Machine Gama do babidi.
 */
export function RemoteScreenOverlays({ visuals, paused }: OverlayProps) {
  if (!visuals) return null;
  const { specialIntro, domain, machineGama } = visuals.scene;
  const character = asCharacterId(visuals.entities.player.character);
  const domainConfig = character ? DOMAIN_EXPANSIONS[character] : null;
  return (
    <>
      {specialIntro.ability === "domainExpansion" ? (
        <DomainExpansionIntro
          active={specialIntro.active}
          character={specialIntro.character}
          paused={paused}
        />
      ) : (
        <SpecialIntro
          active={specialIntro.active}
          character={specialIntro.character}
          ability={specialIntro.ability}
          form={specialIntro.form}
          paused={paused}
        />
      )}
      {domainConfig && (
        <DomainBurstOverlay
          active={domain.burstActive}
          name={domainConfig.name}
          accent={domainConfig.accent}
          paused={paused}
        />
      )}
      <BabidiMachineGama machineGama={machineGama} />
    </>
  );
}

type WorldProps = {
  visuals: RemoteBattleVisuals | null;
  /** Posição suavizada do avatar remoto (pacote de 10 Hz interpolado). */
  position: { x: number; y: number } | null;
  /** Base do objeto `Player`; só os campos de `RemotePlayerView` mudam. */
  localPlayer: Player;
  npc: MainNpcState;
  npcType: string;
  npcPhase: number;
  isNpcDying: boolean;
  TILE_SIZE: number;
  PLAYER_SIZE: number;
  /** Nick acima do avatar remoto (#537). */
  nameTag?: string;
};

/**
 * Avatar do outro jogador e tudo que as habilidades dele geram no mundo.
 * Usa o próprio `BattleEntities` (camada `remotePlayer`), então forma, arma,
 * transformação, aliados, pet, feixes, clones e projéteis saem com o mesmo
 * visual do lado de quem usou.
 */
export function RemoteWorldEffects({
  visuals,
  position,
  localPlayer,
  npc,
  npcType,
  npcPhase,
  isNpcDying,
  TILE_SIZE,
  PLAYER_SIZE,
  nameTag,
}: WorldProps) {
  if (!visuals) return null;
  const { entities, scene } = visuals;
  const { killerQueenSrc, battle, player: view, ...effects } = entities;
  const character = asCharacterId(view.character);
  if (!character) return null;
  const x = position?.x ?? view.x;
  const y = position?.y ?? view.y;
  const player: Player = { ...localPlayer, ...view, character, x, y };

  return (
    <>
      <BattleEntities
        {...effects}
        layer="remotePlayer"
        player={player}
        npc={npc}
        battle={{ ...battle, npcPhase, isNpcDying }}
        npcType={npcType}
        summons={[]}
        coffins={[]}
        lootBags={[]}
        TILE_SIZE={TILE_SIZE}
        PLAYER_SIZE={PLAYER_SIZE}
        killerQueenSprite={() => killerQueenSrc ?? ""}
        playerNameTag={nameTag}
      />
      <DrikaSigiloOverlay
        character={character}
        playerX={x}
        playerY={y}
        pentagramVisible={scene.sigilo.pentagramVisible}
        selectedArmIcon={scene.sigilo.selectedArmIcon}
      />
      <ChargeParticles {...scene.charge} playerX={x} playerY={y} />
      <KokusenAnimation
        active={scene.kokusen.active}
        frame={scene.kokusen.frame}
        npcX={scene.target.x}
        npcY={scene.target.y}
        npcHeight={scene.target.height}
      />
      <DivergentFistAnimation
        frame={scene.divergentFistFrame}
        npcX={scene.target.x}
        npcY={scene.target.y}
        npcHeight={scene.target.height}
      />
      <BlackFlashAnimation
        active={scene.blackFlash.active}
        variant={scene.blackFlash.variant}
        playerX={x}
        playerY={y}
      />
    </>
  );
}
