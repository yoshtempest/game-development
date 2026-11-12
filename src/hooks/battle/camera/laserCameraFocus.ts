import type { CameraFocus } from "@/hooks/battle/effects/cameraSequence/useCameraSequence";
import type { MaugreloAI } from "@/services/npc/attacks/maugrelo/state";

/** Zoom do foco de pré-laser: o mesmo leve aproximar da transformação Vastolord. */
export const LASER_CAMERA_FOCUS_ZOOM = 1.2;

/**
 * Estágios da fase 2 do Maugrelo que antecedem o laser de varredura.
 *
 * O `preMove` sozinho dura 100ms (e o `landing`, 300ms): o lerp da câmera
 * (10% por frame) não chega ao Maugrelo nesse tempo. A descida já é o
 * telegrafo do laser — a fase 2 sempre segue `descending → landing → preMove
 * → laser` —, então o foco começa nela para a câmera de fato chegar nele.
 */
const MAUGRELO_PRE_LASER_STAGES: ReadonlySet<MaugreloAI["phase2State"]> =
  new Set(["descending", "landing", "preMove"]);

type Params = {
  playerState: PlayerState;
  /** O intro (slow-motion) do Laser Vastolord é a janela de pré-laser dele. */
  specialIntroActive: boolean;
  specialIntroCharacter: string | null;
  specialIntroAbility: string | null;
  npcType: string;
  npcPhase: number;
  maugreloPhase2State: MaugreloAI["phase2State"] | undefined;
};

/**
 * Foco de câmera no momento pré-laser de quem vai disparar (issue #492).
 *
 * É derivado do estado, como o foco do intro do alfa, e não disparado por
 * `triggerFocus`: o foco de `useCameraSequence` congela a batalha
 * (`isFrozen` entra no `isPaused`), o que cancelaria o próprio laser do player
 * (`useSkillGuard` aborta em pausa) e travaria o jogador justo quando ele
 * precisa se agachar para o laser do Maugrelo.
 *
 * - Player: carga do Kamehameha (`chargingKamehameha`) e o intro do Laser
 *   Vastolord. A câmera já segue o player, então o foco é o zoom.
 * - NPC: estágios de `MAUGRELO_PRE_LASER_STAGES` na fase 2.
 */
export function getLaserCameraFocus({
  playerState,
  specialIntroActive,
  specialIntroCharacter,
  specialIntroAbility,
  npcType,
  npcPhase,
  maugreloPhase2State,
}: Params): CameraFocus {
  const vastolordPreLaser =
    specialIntroActive &&
    specialIntroCharacter === "marshadow" &&
    specialIntroAbility === "laser";
  if (playerState === "chargingKamehameha" || vastolordPreLaser) {
    return { entity: "player", zoom: LASER_CAMERA_FOCUS_ZOOM };
  }

  if (
    npcType === "maugrelo" &&
    npcPhase === 2 &&
    maugreloPhase2State !== undefined &&
    MAUGRELO_PRE_LASER_STAGES.has(maugreloPhase2State)
  ) {
    return { entity: "npc", zoom: LASER_CAMERA_FOCUS_ZOOM };
  }

  return null;
}
