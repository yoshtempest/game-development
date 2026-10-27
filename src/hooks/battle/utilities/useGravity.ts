import { useEffect, useRef, type RefObject } from "react";
import { getLandingY, getGroundAtX } from "@/gameRules/battle/obstacles";
import {
  HONORED_ONE_RISE_MS,
  HONORED_ONE_RISE_Y,
} from "@/gameRules/battle/cursedEnergy";
import {
  GENKI_DAMA_RISE_MS,
  GENKI_DAMA_RISE_Y,
} from "@/data/characters/emanuel/emanuel";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import type { CollisionParams } from "@/utils/types/battle/collision";

export type { CollisionParams };

const gravity = 1;

export function useBattleGravity(
  setPlayer: React.Dispatch<React.SetStateAction<Player>>,
  collisionRef: RefObject<CollisionParams>,
  hasDoubleJumped: RefObject<boolean>,
  hasUsedFallingAttack?: RefObject<boolean>,
  playerModeRef?: RefObject<PlayerMode>,
  honoredRiseStartRef?: RefObject<number>,
  honoredRiseStartYRef?: RefObject<number>,
  honoredFallRef?: RefObject<boolean>,
  genkiDamaRiseStartRef?: RefObject<number>,
  genkiDamaRiseStartYRef?: RefObject<number>,
) {
  const playerModeInternalRef = useRef(playerModeRef?.current ?? "explore");
  if (playerModeRef) playerModeInternalRef.current = playerModeRef.current;

  const honoredRiseStartInternalRef = useRef(honoredRiseStartRef?.current ?? 0);
  if (honoredRiseStartRef)
    honoredRiseStartInternalRef.current = honoredRiseStartRef.current;
  const honoredRiseStartYInternalRef = useRef(
    honoredRiseStartYRef?.current ?? 0,
  );
  if (honoredRiseStartYRef)
    honoredRiseStartYInternalRef.current = honoredRiseStartYRef.current;
  const honoredFallInternalRef = useRef(honoredFallRef?.current ?? false);
  if (honoredFallRef) honoredFallInternalRef.current = honoredFallRef.current;

  const genkiDamaRiseStartInternalRef = useRef(
    genkiDamaRiseStartRef?.current ?? 0,
  );
  if (genkiDamaRiseStartRef)
    genkiDamaRiseStartInternalRef.current = genkiDamaRiseStartRef.current;
  const genkiDamaRiseStartYInternalRef = useRef(
    genkiDamaRiseStartYRef?.current ?? 0,
  );
  if (genkiDamaRiseStartYRef)
    genkiDamaRiseStartYInternalRef.current = genkiDamaRiseStartYRef.current;

  useEffect(() => {
    // Devolve o mesmo objeto quando os campos físicos não mudaram: sem esse
    // bailout a gravidade reatribuía o player 60×/s mesmo parado no chão,
    // re-renderizando os ~69 consumidores de `usePlayer()` para sempre.
    const settle = (base: Player, next: Player) =>
      next.y === base.y &&
      next.velY === base.velY &&
      next.state === base.state &&
      next.groundY === base.groundY
        ? base
        : next;

    const interval = setInterval(() => {
      if (playerModeInternalRef.current === "menu") return;

      setPlayer((p) => {
        if (p.throwStartTime > 0) {
          return settle(p, { ...p, velY: 0, state: "fallen" });
        }

        if (p.state === "fallingAttack") {
          return settle(p, { ...p, velY: 0 });
        }

        // Passiva "O Abençoado": fase de subida do honored-one — o personagem
        // sobe 400px em y enquanto os inimigos recuam. A queda é feita pela
        // física normal com o estado `falling`.
        if (p.state === "mostHonored") {
          const start = honoredRiseStartInternalRef.current;
          if (start > 0) {
            const progress = Math.min(
              1,
              (Date.now() - start) / HONORED_ONE_RISE_MS,
            );
            const targetY = Math.max(
              0,
              honoredRiseStartYInternalRef.current -
                HONORED_ONE_RISE_Y * progress,
            );
            return settle(p, { ...p, velY: 0, y: targetY });
          }
          return settle(p, { ...p, velY: 0 });
        }

        // Genki Dama do emanuel: a subida é manual (300px em 2.5s). Enquanto
        // prepara (preparingGenkiDama) e durante o arremesso (throwGenkiDama)
        // o personagem é segurado no topo; a queda só acontece quando o hook
        // troca para o estado `falling` no release.
        if (p.state === "genkiDamaRising") {
          const start = genkiDamaRiseStartInternalRef.current;
          if (start > 0) {
            const progress = Math.min(
              1,
              (Date.now() - start) / GENKI_DAMA_RISE_MS,
            );
            const targetY = Math.max(
              0,
              genkiDamaRiseStartYInternalRef.current -
                GENKI_DAMA_RISE_Y * progress,
            );
            return settle(p, { ...p, velY: 0, y: targetY });
          }
          return settle(p, { ...p, velY: 0 });
        }
        if (ALL_PREDICATES.isGenkiDama(p.state)) {
          const topY = Math.max(
            0,
            genkiDamaRiseStartYInternalRef.current - GENKI_DAMA_RISE_Y,
          );
          return settle(p, { ...p, velY: 0, y: topY });
        }

        const { map } = collisionRef.current;
        const obstacles = map?.obstacles ?? [];

        const prevY = p.y;
        const newVelY = p.velY + gravity;
        const newY = p.y + newVelY;

        if (obstacles.length > 0) {
          const groundBelow = getGroundAtX(p.y + 2, p.x, obstacles);

          if (p.velY === 0 && p.y === groundBelow) {
            return settle(p, { ...p, groundY: groundBelow });
          }

          const landingY = getLandingY(prevY, newY, p.x, obstacles);

          if (newY >= landingY) {
            hasDoubleJumped.current = false;
            if (hasUsedFallingAttack) hasUsedFallingAttack.current = false;
            const wasAirborne = ALL_PREDICATES.isLanding(p.state);
            return settle(p, {
              ...p,
              y: landingY,
              velY: 0,
              groundY: landingY,
              state: wasAirborne
                ? honoredFallInternalRef.current
                  ? "idleCrounched"
                  : "idle"
                : p.state,
            });
          }
        } else {
          if (newY >= p.groundY) {
            hasDoubleJumped.current = false;
            if (hasUsedFallingAttack) hasUsedFallingAttack.current = false;
            const wasAirborne = ALL_PREDICATES.isLanding(p.state);
            return settle(p, {
              ...p,
              y: p.groundY,
              velY: 0,
              state: wasAirborne
                ? honoredFallInternalRef.current
                  ? "idleCrounched"
                  : "idle"
                : p.state,
            });
          }
        }

        return settle(p, {
          ...p,
          y: newY,
          velY: newVelY,
          state: ALL_PREDICATES.isAirFrozen(p.state)
            ? p.state
            : newVelY > 0
              ? "falling"
              : p.state === "preJump"
                ? "preJump"
                : "jump",
        });
      });
    }, 16);

    return () => clearInterval(interval);
  }, [
    setPlayer,
    collisionRef,
    hasDoubleJumped,
    hasUsedFallingAttack,
    playerModeRef,
    honoredRiseStartRef,
    honoredRiseStartYRef,
    honoredFallRef,
    genkiDamaRiseStartRef,
    genkiDamaRiseStartYRef,
  ]);
}
