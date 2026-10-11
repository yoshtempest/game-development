import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useLatestRef } from "@/hooks/useLatestRef";
import { useNavigate } from "react-router";
import { ALL_PREDICATES } from "@/gameRules/battle/playerStates";
import type { Task, TaskInstruction } from "@/gameRules/tutorial/combatTasks";
import {
  TASK_INSTRUCTIONS,
  getTaskStatus,
  TASKS,
} from "@/gameRules/tutorial/combatTasks";

export function useCombatTasks() {
  const navigate = useNavigate();
  const { player, setMode } = usePlayer();
  const [currentTask, setCurrentTask] = useState<Task>("moveLeft");
  const initialX = useRef<number | null>(null);
  const setModeRef = useLatestRef(setMode);
  const navigateRef = useLatestRef(navigate);

  useEffect(() => {
    if (initialX.current === null) {
      initialX.current = player.x;
    }
  });

  useEffect(() => {
    if (currentTask !== "moveLeft") return;
    if (player.x <= initialX.current! - 10) setCurrentTask("moveRight");
  }, [player.x, currentTask]);

  useEffect(() => {
    if (currentTask !== "moveRight") return;
    if (player.x >= initialX.current! + 40) {
      setCurrentTask("jump");
      initialX.current = player.x;
    }
  }, [player.x, currentTask]);

  useEffect(() => {
    if (currentTask !== "jump") return;
    if (player.y !== player.groundY) setCurrentTask("attack");
  }, [player.state, player.y, player.groundY, currentTask]);

  useEffect(() => {
    if (currentTask !== "attack") return;
    if (ALL_PREDICATES.isAttackPose(player.state)) setCurrentTask("crounch");
  }, [player.state, currentTask]);

  useEffect(() => {
    if (currentTask !== "crounch") return;
    if (player.state === "idleCrounched") setCurrentTask("block");
  }, [player.state, currentTask]);

  useEffect(() => {
    if (currentTask !== "block") return;
    if (player.state === "blocked") setCurrentTask("done");
  }, [player.state, currentTask]);

  useEffect(() => {
    if (currentTask !== "done") return;
    const t = setTimeout(() => {
      setModeRef.current("explore");
      void navigateRef.current("/home");
    }, 2000);
    return () => clearTimeout(t);
  }, [currentTask, navigateRef, setModeRef]);

  const instruction: TaskInstruction = TASK_INSTRUCTIONS[currentTask];

  return {
    currentTask,
    instruction,
    TASKS,
    getTaskStatus: (task: Task) => getTaskStatus(task, currentTask),
  };
}
