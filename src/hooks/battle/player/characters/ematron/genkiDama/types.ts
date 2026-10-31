import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { SoundId } from "@/utils/audio/soundId";
import type { RefObject } from "react";

export type GenkiDamaProps = {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  battleManaRef: RefObject<BattleManaApi | null>;
  freezeActionsUntilRef: RefObject<number>;
  /** Usado para o pouso pós-habilidade virar `idleCrounched` (mesmo ref do honored-one). */
  honoredFallRef: RefObject<boolean>;
  /** Instante de início da subida (gravidade usa para subir 300px em 2.5s). */
  genkiDamaRiseStartRef: RefObject<number>;
  /** y do jogador no instante em que a subida disparou. */
  genkiDamaRiseStartYRef: RefObject<number>;
  /** NPC principal (x/y lidos via latestRef para o voo da Genki Dama). */
  npc: { x: number; y: number };
  /** Dispara o dano em área na explosão. */
  onExplode: (x: number, y: number, radius: number, multiplier: number) => void;
  playSound: (sound: SoundId, loop?: boolean, volumeOverride?: number) => void;
  /** Chamado quando o press realmente inicia a Genki Dama (carga da Expansão de Domínio). */
  onUsed?: () => void;
  isPausedRef: RefObject<boolean>;
  /** true quando os controles gerais de batalha estão desabilitados (pause, transição de fase, throw). */
  disabledRef: RefObject<boolean>;
  battleEndedRef: RefObject<boolean>;
};