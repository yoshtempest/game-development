import { useRef, useEffect, useMemo } from "react";
import type { RefObject } from "react";
import {
  moveLeftBattle,
  moveRightBattle,
  dashLeftBattle,
  dashRightBattle,
  blockStart,
  blockEnd,
  idleBattle,
  crouchToggle,
  isPlayerAttackHolding,
} from "@/gameRules/movement/battle";

import { canJump } from "@/gameRules/movement/state";
import { isHorizontallyBlocked } from "@/gameRules/battle/obstacles";
import { DASH_DURATION, DASH_INTERVAL } from "@/gameRules/movement/constants";
import { PLAYER_JUMP_FORCE } from "@/gameRules/movement/constants";
import {
  useBattleGravity,
  type CollisionParams,
} from "@/hooks/battle/utilities/useGravity";
import { useCharacterProgress } from "@/contexts/CharacterProgressContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { getSkillTree } from "@/data/passiveSkills";
import {
  isPlayerFrozen,
  isPlayerParalyzed,
} from "@/gameRules/battle/status/statusEffects";
import type { EmanuelComboApi } from "@/hooks/battle/player/characters/ematron/useEmanuelCombo";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";

const PLAYER_COLLISION_W = 30;
const PLAYER_COLLISION_H = 50;

/**
 * Chave do sprite do combo do emanuel para o gate de "uma instância de dano
 * por sprite": os windups (preAttack/airGrab/jump/falling) mapeiam para o golpe
 * que estão apresentando, para que presses repetidos dentro do MESMO golpe
 * sejam ignorados.
 */
function emanuelComboSpriteKey(state: PlayerState, combo: EmanuelComboApi) {
  if (ALL_PREDICATES.isAirMelee(state)) return "airKick";
  if (ALL_PREDICATES.isAirFalling(state)) return "airKick";
  if (state === "preAttack") {
    const step = combo.steps[combo.stepIndexRef.current] ?? combo.steps[0];
    return step?.state ?? "idle";
  }
  return state;
}

export function useBattleMovement(
  setPlayer: React.Dispatch<React.SetStateAction<Player>>,
  collisionRef: React.RefObject<CollisionParams>,
  lastBlockPressRef: React.RefObject<number>,
  playerModeRef?: RefObject<PlayerMode>,
  freezeActionsUntilRef?: React.RefObject<number>,
  lastAttackPressRef?: React.RefObject<number>,
  honoredRiseStartRef?: RefObject<number>,
  honoredRiseStartYRef?: RefObject<number>,
  honoredFallRef?: RefObject<boolean>,
  forcePunchRef?: RefObject<boolean>,
  emanuelCombo?: EmanuelComboApi,
  playerRef?: RefObject<Player>,
  genkiDamaRiseStartRef?: RefObject<number>,
  genkiDamaRiseStartYRef?: RefObject<number>,
  riquelmePunchRef?: RefObject<boolean>,
) {
  const leftIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const rightIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dashIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const downLockRef = useRef(false);
  const isJumping = useRef(false);
  const hasDoubleJumped = useRef(false);
  const hasUsedFallingAttack = useRef(false);

  const isFrozenBySpecial = () =>
    !!freezeActionsUntilRef?.current &&
    freezeActionsUntilRef.current > Date.now();

  const { progress } = useCharacterProgress();
  const progressRef = useLatestRef(progress);

  const jumpForce = PLAYER_JUMP_FORCE;

  useBattleGravity(
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
  );

  const idleTimeout = useMemo(() => idleTimeoutRef.current, []);
  useEffect(() => {
    const left = leftIntervalRef.current;
    const right = rightIntervalRef.current;
    const dash = dashIntervalRef.current;
    const timeout = idleTimeout;
    return () => {
      if (left) clearInterval(left);
      if (right) clearInterval(right);
      if (dash) clearInterval(dash);
      if (timeout) clearTimeout(timeout);
    };
  }, [idleTimeout]);

  function checkHorizontalBlock(p: Player): boolean {
    const { map } = collisionRef.current;
    if (!map || map.obstacles.length === 0) return false;

    if (p.velY > 0) return false;

    const playerLeft = p.x - PLAYER_COLLISION_W / 2;
    const playerTop = p.y - PLAYER_COLLISION_H;
    const playerRight = p.x + PLAYER_COLLISION_W / 2;
    const playerBottom = p.y;

    return isHorizontallyBlocked(
      playerLeft,
      playerTop,
      playerRight,
      playerBottom,
      map.obstacles,
    );
  }

  function startMoveInterval(
    intervalRef: React.RefObject<NodeJS.Timeout | null>,
    stepFn: (p: Player) => Player,
  ) {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      if (isFrozenBySpecial()) return;
      setPlayer((p) => {
        if (isPlayerAttackHolding(p)) return p;
        const moved = stepFn(p);
        if (checkHorizontalBlock(moved)) return p;
        return moved;
      });
    }, 30);
  }

  function stopMoveInterval(
    intervalRef: React.RefObject<NodeJS.Timeout | null>,
  ) {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIdleIfNotMoving();
  }

  function startMoveLeft() {
    if (isFrozenBySpecial()) return;
    startMoveInterval(leftIntervalRef, (p) =>
      moveLeftBattle(p, (progressRef.current[p.character]?.sleep ?? 0) > 0),
    );
  }

  function stopMoveLeft() {
    stopMoveInterval(leftIntervalRef);
  }

  function startMoveRight() {
    if (isFrozenBySpecial()) return;
    startMoveInterval(rightIntervalRef, (p) =>
      moveRightBattle(p, (progressRef.current[p.character]?.sleep ?? 0) > 0),
    );
  }

  function stopMoveRight() {
    stopMoveInterval(rightIntervalRef);
  }

  function setIdleIfNotMoving() {
    if (isFrozenBySpecial()) return;
    if (!leftIntervalRef.current && !rightIntervalRef.current) {
      setPlayer((p) => idleBattle(p));
    }
  }

  function moveUpBattle() {
    if (isFrozenBySpecial()) return;
    if (!canJump(isJumping.current)) return;

    setPlayer((p) => {
      if (isPlayerAttackHolding(p)) return p;
      if (isPlayerFrozen(p)) return p;
      if (ALL_PREDICATES.isInvulnerable(p.state)) return p;

      const tree = getSkillTree(p.character);
      const skill = tree.skills.find((s) => s.id === "doubleJump");
      const level = progressRef.current[p.character]?.level ?? 1;
      const canDoubleJump = skill ? level >= skill.levelRequired : false;

      if (p.y === p.groundY) {
        hasDoubleJumped.current = false;
        hasUsedFallingAttack.current = false;
        return { ...p, velY: jumpForce, state: "preJump" };
      }

      if (!canDoubleJump || hasDoubleJumped.current) return p;
      hasDoubleJumped.current = true;
      return { ...p, velY: jumpForce, state: "jump" };
    });

    setTimeout(() => {
      setPlayer((p) => {
        if (p.state !== "preJump") return p;
        return { ...p, state: "jump" };
      });
    }, 250);
  }

  function blockStartAction() {
    if (isFrozenBySpecial()) return;
    if (downLockRef.current) return;
    downLockRef.current = true;
    lastBlockPressRef.current = Date.now();
    setPlayer((p) => {
      if (isPlayerAttackHolding(p)) return p;
      if (isPlayerFrozen(p)) return p;
      return blockStart(p);
    });
  }

  function blockEndAction() {
    if (!downLockRef.current) return;
    downLockRef.current = false;
    setPlayer((p) => {
      if (isPlayerAttackHolding(p)) return p;
      return blockEnd(p);
    });
  }

  function toggleCrouch() {
    if (isFrozenBySpecial()) return;
    setPlayer((p) => {
      if (isPlayerAttackHolding(p)) return p;
      if (isPlayerFrozen(p)) return p;
      return crouchToggle(p);
    });
  }

  function attack() {
    if (isFrozenBySpecial()) return;
    if (lastAttackPressRef) lastAttackPressRef.current = Date.now();

    let comboWindup: PlayerState | null = null;

    const current = playerRef?.current;
    const isEmanuelAttack =
      current?.character === "emanuel" && current.mode === "battle";

    if (isEmanuelAttack && emanuelCombo) {
      emanuelCombo.activeRef.current = false;
      const state = current.state;
      const airComboActive =
        ALL_PREDICATES.isAirFalling(state) && emanuelCombo.airActiveRef.current;
      const midComboDisplay =
        state === "preAttack" ||
        ALL_PREDICATES.isCombo(state) ||
        airComboActive;

      const comboEligible =
        state === "idle" || state === "attack" || midComboDisplay;

      if (
        !isPlayerFrozen(current) &&
        !isPlayerParalyzed(current) &&
        comboEligible
      ) {
        // Uma instância de dano por sprite do combo: o 1º press de um golpe em
        // exibição avança/encadeia o próximo step; presses repetidos no MESMO
        // sprite (mash/hold) são ignorados — não cortam a animação nem aplicam
        // dano extra (o handlePlayerHit também barra o caminho do cooldown).
        const spriteKey = emanuelComboSpriteKey(state, emanuelCombo);
        if (
          midComboDisplay &&
          emanuelCombo.lastSpriteKeyRef.current === spriteKey
        ) {
          return;
        }

        const step = emanuelCombo.advance(Date.now());
        emanuelCombo.activeRef.current = true;
        emanuelCombo.lastSpriteKeyRef.current = spriteKey;
        comboWindup = step.windupState;
      }
    }

    // Riquelme: o básico intercala kick/attack/punch. O sorteio fica fora do
    // updater de estado (nenhum side effect ali) e o `punch` deriva do windup
    // `preAttack` — o `usePlayerAnimation` resolve o `next` para `punch`
    // quando `riquelmePunchRef` está marcado. O Punho Divergente
    // (`forcePunchRef`) continua forçando o soco (`preAttack` → attack).
    const isRiquelmeAttack = current?.character === "riquelme";
    const riquelmeRolls = isRiquelmeAttack && !forcePunchRef?.current;
    const riquelmeRoll = riquelmeRolls ? Math.random() : 1;
    const riquelmeKick = riquelmeRolls && riquelmeRoll < 1 / 3;
    const riquelmePunch =
      riquelmeRolls && !riquelmeKick && riquelmeRoll < 2 / 3;
    if (riquelmePunchRef) riquelmePunchRef.current = riquelmePunch;

    setPlayer((p) => {
      if (isPlayerFrozen(p) || isPlayerParalyzed(p)) return p;
      if (ALL_PREDICATES.isInvulnerable(p.state)) return p;

      if (isEmanuelAttack && emanuelCombo) {
        if (p.state === "blocked") return { ...p, state: "blockAttack" };

        if (
          p.state === "falling" &&
          !emanuelCombo.airActiveRef.current &&
          !hasUsedFallingAttack.current
        ) {
          hasUsedFallingAttack.current = true;
          return { ...p, state: "fallingAttack" };
        }

        if (comboWindup != null) {
          // Buffer de combo: press durante um golpe do combo em exibição
          // (punch/hook/lowKick) não corta o sprite — o próximo step aguarda o
          // fim da animação atual no usePlayerAnimation.
          if (ALL_PREDICATES.isGroundCombo(p.state)) {
            emanuelCombo.queuedStepIndexRef.current =
              emanuelCombo.stepIndexRef.current;
            return p;
          }

          if (comboWindup === "jump") {
            emanuelCombo.airActiveRef.current = true;
            hasUsedFallingAttack.current = false;
            hasDoubleJumped.current = false;
            return { ...p, velY: jumpForce, state: "jump" };
          }

          // Transição "limpa": nenhum golpe em exibição sendo bufferizado —
          // descarta buffer obsoleto (ex.: interrompido por dash/block/jump) e
          // entra no step diretamente (preAttack ou lowKick, ambos em solo).
          emanuelCombo.queuedStepIndexRef.current = null;
          emanuelCombo.airActiveRef.current = false;
          return { ...p, state: comboWindup };
        }

        return p;
      }

      if (p.state === "falling" && !hasUsedFallingAttack.current) {
        hasUsedFallingAttack.current = true;
        return { ...p, state: "fallingAttack" };
      }
      if (p.state === "blocked") return { ...p, state: "blockAttack" };
      if (p.state !== "idle") return p;
      if (p.character === "artur") {
        return { ...p, state: "attack" };
      }
      if (p.character === "riquelme") {
        return {
          ...p,
          state: riquelmeKick ? "preKick" : "preAttack",
        };
      }
      return { ...p, state: "preAttack" };
    });
  }

  function special() {
    if (isFrozenBySpecial()) return;
    setPlayer((p) => {
      if (isPlayerFrozen(p) || isPlayerParalyzed(p)) return p;
      if (ALL_PREDICATES.isInvulnerable(p.state)) return p;
      if (ALL_PREDICATES.isAirFalling(p.state))
        return { ...p, state: "preSpecialInAir" };
      if (p.state !== "idle") return p;
      return { ...p, state: "preSpecial" };
    });
  }

  function setPlayerState(state: PlayerState) {
    setPlayer((p) => {
      if (p.mode !== "battle") return p;
      return { ...p, state };
    });
  }

  function dash(direction: "left" | "right") {
    if (isFrozenBySpecial()) return;
    if (dashIntervalRef.current) return;

    if (leftIntervalRef.current) {
      clearInterval(leftIntervalRef.current);
      leftIntervalRef.current = null;
    }
    if (rightIntervalRef.current) {
      clearInterval(rightIntervalRef.current);
      rightIntervalRef.current = null;
    }

    const steps = DASH_DURATION / DASH_INTERVAL;
    let stepCount = 0;

    const dashFn = direction === "left" ? dashLeftBattle : dashRightBattle;

    dashIntervalRef.current = setInterval(() => {
      stepCount++;
      setPlayer((p) => {
        if (ALL_PREDICATES.isInvulnerable(p.state)) {
          if (dashIntervalRef.current) {
            clearInterval(dashIntervalRef.current);
            dashIntervalRef.current = null;
          }
          return p;
        }
        if (isPlayerAttackHolding(p)) {
          if (dashIntervalRef.current) {
            clearInterval(dashIntervalRef.current);
            dashIntervalRef.current = null;
          }
          return p;
        }
        if (stepCount >= steps) {
          if (dashIntervalRef.current) {
            clearInterval(dashIntervalRef.current);
            dashIntervalRef.current = null;
          }
          return { ...p, state: "idle" };
        }
        const moved = dashFn(p);
        if (checkHorizontalBlock(moved)) {
          if (dashIntervalRef.current) {
            clearInterval(dashIntervalRef.current);
            dashIntervalRef.current = null;
          }
          return { ...p, state: "idle" };
        }
        return moved;
      });
    }, DASH_INTERVAL);
  }

  return {
    moveUpBattle,
    startMoveLeft,
    stopMoveLeft,
    startMoveRight,
    stopMoveRight,
    blockStart: blockStartAction,
    blockEnd: blockEndAction,
    toggleCrouch,
    attack,
    special,
    dash,
    setPlayerState,
  };
}
