import type { RefObject } from "react";
import type { BattleManaApi } from "@/contexts/BattleManaContext";
import type { PlaySound } from "@/utils/types/audio";
import type { BattleObstacle } from "@/utils/types/maps/battle";
import type { BabidiPortal } from "@/utils/types/character/babidi";

export type Props = {
  player: Player;
  portalsRef: RefObject<BabidiPortal[]>;
  obstaclesRef: RefObject<BattleObstacle[]>;
  playSoundRef: RefObject<PlaySound>;
  battleManaRef: RefObject<BattleManaApi | null>;
  /** A habilidade está utilizável agora (energia + guard) — lido no clique. */
  usableRef: RefObject<boolean>;
  commitPortals: (next: BabidiPortal[]) => void;
  engageLocks: (now: number) => void;
  releaseLocks: () => void;
  /** Desfaz o último portal fincado (o botão vira undo com o par completo). */
  onUndoLast: () => void;
  PLAYER_SIZE: number;
};
