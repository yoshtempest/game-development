import { useCallback, useEffect, useRef, useState } from "react";
import { useGroundItems } from "@/contexts/GroundItemContext";
import { useInventory } from "@/contexts/InventoryContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useFlags } from "@/contexts/FlagContext";
import { usePetProgress } from "@/contexts/PetProgressContext";
import { npcPath } from "@/utils/paths";
import { useToast } from "@/contexts/ToastContext";

const FOOD_PLATE_SPOIL_MS = 60_000; // 1 minuto
const RAPARIGA_CHECK_INTERVAL_MS = 5_000; // 5 segundos
const RAPARIGA_SPAWN_CHANCE = 0.05; // 5%
const RAPARIGA_EAT_DURATION_MS = 60_000; // 1 minuto
const STEP_MS = 300; // Igual ao Janderson
const TURN_MS = 300;

type RaparigaState = "idle" | "walking" | "eating" | "waitingChoice" | "leaving";

type RouteStep = {
  gridX: number;
  gridY: number;
  ms: number;
  facing: "left" | "right" | "up" | "down";
};

type FoodPlateEncounterReturn = {
  raparigaState: RaparigaState;
  raparigaPos: { gridX: number; gridY: number };
  raparigaSprite: string;
  raparigaFacing: "left" | "right" | "up" | "down";
  showChoiceBox: boolean;
  showTalking: boolean;
  talkingMessage: string;
  handleChoice: (choice: "dar denovo" | "não quero dar") => void;
};

export function useFoodPlateEncounter(): FoodPlateEncounterReturn {
  const { player } = usePlayer();
  const { hasItem, removeItem } = useInventory();
  const { setFlag } = useFlags();
  const { getLootAt, removeItem: removeGroundItem } = useGroundItems();
  const petProgress = usePetProgress() as any;
  const addPet = petProgress.addPet ?? petProgress.unlockPet ?? petProgress.addCollection;
  const { showToast } = useToast();

  const [raparigaState, setRaparigaState] = useState<RaparigaState>("idle");
  const [raparigaPos, setRaparigaPos] = useState({ gridX: 0, gridY: 0 });
  const [raparigaSprite, setRaparigaSprite] = useState("");
  const [raparigaFacing, setRaparigaFacing] = useState<"left" | "right" | "up" | "down">("down");
  const [showChoiceBox, setShowChoiceBox] = useState(false);
  const [showTalking, setShowTalking] = useState(false);
  const [talkingMessage, setTalkingMessage] = useState("");

  const routeRef = useRef<RouteStep[]>([]);
  const stepIndexRef = useRef(0);
  const checkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const plateLocationRef = useRef<{ locationId: string; x: number; y: number } | null>(null);
  const isProcessingRef = useRef(false);

  const raparigaStateRef = useRef<RaparigaState>("idle");
  raparigaStateRef.current = raparigaState;

  const raparigaPosRef = useRef({ gridX: 0, gridY: 0 });
  raparigaPosRef.current = raparigaPos;

  // Verifica se tem foodPlate no chão (não estragado) a cada 5s
  useEffect(() => {
    const checkForFoodPlate = () => {
      if (raparigaStateRef.current !== "idle" || isProcessingRef.current) return;

      const currentLocation = (player as any)?.locationId ?? (player as any)?.sceneId;
      if (!currentLocation) return;

      const loots = getLootAt(currentLocation);
      const foodPlateLoot = loots.find(
        (loot) =>
          loot.items.some(
            (item) => item.id === "foodPlate" && item.droppedAt && Date.now() - item.droppedAt < FOOD_PLATE_SPOIL_MS
          )
      );

      if (foodPlateLoot && Math.random() < RAPARIGA_SPAWN_CHANCE) {
        isProcessingRef.current = true;
        startRaparigaEncounter(foodPlateLoot);
      }
    };

    const interval = setInterval(checkForFoodPlate, RAPARIGA_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [(player as any)?.locationId, (player as any)?.sceneId, getLootAt]);

  const startRaparigaEncounter = useCallback(
    (loot: { locationId: string; x: number; y: number; items: Array<{ id: string; droppedAt?: number }> }) => {
      const plateX = loot.x;
      const plateY = loot.y;
      const locationId = loot.locationId;

      plateLocationRef.current = { locationId, x: plateX, y: plateY };

      // Posição inicial da Rapariga (fora da tela)
      const startX = 0.5;
      const startY = 12.5;

      setRaparigaPos({ gridX: startX, gridY: startY });
      setRaparigaSprite(npcPath("/rapariga/default.svg"));
      setRaparigaFacing("down");
      setRaparigaState("walking");

      // Calcula rota até o prato (estilo Janderson)
      const route: RouteStep[] = [];

      const dx = plateX - startX;
      const dy = plateY - startY;

      if (Math.abs(dx) > Math.abs(dy)) {
        // Movimento horizontal primeiro
        if (dx > 0) {
          route.push({ gridX: startX, gridY: startY, ms: TURN_MS, facing: "right" });
          const steps = Math.floor(plateX - startX);
          for (let i = 1; i <= steps; i++) {
            route.push({ gridX: startX + i, gridY: startY, ms: STEP_MS, facing: "right" });
          }
        } else {
          route.push({ gridX: startX, gridY: startY, ms: TURN_MS, facing: "left" });
          const steps = Math.floor(startX - plateX);
          for (let i = 1; i <= steps; i++) {
            route.push({ gridX: startX - i, gridY: startY, ms: STEP_MS, facing: "left" });
          }
        }
        // Depois vertical
        if (dy > 0) {
          route.push({ gridX: plateX, gridY: startY, ms: TURN_MS, facing: "down" });
          const steps = Math.floor(plateY - startY);
          for (let i = 1; i <= steps; i++) {
            route.push({ gridX: plateX, gridY: startY + i, ms: STEP_MS, facing: "down" });
          }
        } else if (dy < 0) {
          route.push({ gridX: plateX, gridY: startY, ms: TURN_MS, facing: "up" });
          const steps = Math.floor(startY - plateY);
          for (let i = 1; i <= steps; i++) {
            route.push({ gridX: plateX, gridY: startY - i, ms: STEP_MS, facing: "up" });
          }
        }
      } else {
        // Movimento vertical primeiro
        if (dy > 0) {
          route.push({ gridX: startX, gridY: startY, ms: TURN_MS, facing: "down" });
          const steps = Math.floor(plateY - startY);
          for (let i = 1; i <= steps; i++) {
            route.push({ gridX: startX, gridY: startY + i, ms: STEP_MS, facing: "down" });
          }
        } else if (dy < 0) {
          route.push({ gridX: startX, gridY: startY, ms: TURN_MS, facing: "up" });
          const steps = Math.floor(startY - plateY);
          for (let i = 1; i <= steps; i++) {
            route.push({ gridX: startX, gridY: startY - i, ms: STEP_MS, facing: "up" });
          }
        }
        // Depois horizontal
        if (dx > 0) {
          route.push({ gridX: startX, gridY: plateY, ms: TURN_MS, facing: "right" });
          const steps = Math.floor(plateX - startX);
          for (let i = 1; i <= steps; i++) {
            route.push({ gridX: startX + i, gridY: plateY, ms: STEP_MS, facing: "right" });
          }
        } else if (dx < 0) {
          route.push({ gridX: startX, gridY: plateY, ms: TURN_MS, facing: "left" });
          const steps = Math.floor(startX - plateX);
          for (let i = 1; i <= steps; i++) {
            route.push({ gridX: startX - i, gridY: plateY, ms: STEP_MS, facing: "left" });
          }
        }
      }

      routeRef.current = route;
      stepIndexRef.current = 0;

      // Começa a andar
      walkRoute();
    },
    [getLootAt]
  );

  const walkRoute = useCallback(() => {
    if (stepIndexRef.current >= routeRef.current.length) {
      // Chegou no prato
      onReachedPlate();
      return;
    }

    const step = routeRef.current[stepIndexRef.current];
    if (!step) return;
    
    setRaparigaPos({ gridX: step.gridX, gridY: step.gridY });
    setRaparigaFacing(step.facing);

    // Atualiza sprite baseado na direção e se está movendo
    const isMoving = step.ms === STEP_MS;
    const baseSprite = isMoving ? `moving${step.facing.charAt(0).toUpperCase() + step.facing.slice(1)}` : step.facing;
    setRaparigaSprite(npcPath(`/rapariga/${baseSprite}.svg`));

    stepIndexRef.current++;

    moveTimerRef.current = setTimeout(() => {
      walkRoute();
    }, step.ms);
  }, []);

  const onReachedPlate = useCallback(() => {
    // Troca para good.svg
    setRaparigaSprite(npcPath("/rapariga/good.svg"));
    setRaparigaState("eating");

    // Remove o prato do chão
    const plate = plateLocationRef.current;
    if (plate) {
      removeGroundItem(plate.locationId, plate.x, plate.y, "foodPlate");
    }

    // Timer de comer (1 minuto)
    stateTimerRef.current = setTimeout(() => {
      setRaparigaState("waitingChoice");
      showChoiceBoxUI();
    }, RAPARIGA_EAT_DURATION_MS);
  }, [removeGroundItem]);

  const showChoiceBoxUI = useCallback(() => {
    setShowChoiceBox(true);
  }, []);

  const handleChoice = useCallback(
    (choice: "dar denovo" | "não quero dar") => {
      setShowChoiceBox(false);

      if (choice === "dar denovo") {
        if (hasItem("foodPlate")) {
          removeItem("foodPlate");
          // Desbloqueia pet e faz seguir
          unlockRaparigaPet();
        } else {
          // Toast: não tem comida
          showToast({
            icon: "/assets/items/foodPlate.svg",
            text: "Você não possui o prato de comida para dar denovo",
          });
          // Força escolha "não quero dar"
          setTimeout(() => {
            leaveRapariga();
          }, 500);
        }
      } else {
        // Sai correndo
        leaveRapariga();
      }
    },
    [hasItem, removeItem, showToast]
  );

  const leaveRapariga = useCallback(() => {
    setRaparigaState("leaving");
    // Anda de volta para fora da tela
    const leaveRoute: RouteStep[] = [];
    const currentX = raparigaPosRef.current.gridX;
    const currentY = raparigaPosRef.current.gridY;

    // Anda para a esquerda até sair da tela
    for (let x = Math.floor(currentX); x >= -2; x--) {
      leaveRoute.push({ gridX: x, gridY: currentY, ms: STEP_MS, facing: "left" });
    }

    routeRef.current = leaveRoute;
    stepIndexRef.current = 0;
    setRaparigaState("leaving");
    walkLeaveRoute();
  }, []);

  const walkLeaveRoute = useCallback(() => {
    if (stepIndexRef.current >= routeRef.current.length) {
      // Saiu da tela
      setRaparigaState("idle");
      isProcessingRef.current = false;
      return;
    }

    const step = routeRef.current[stepIndexRef.current];
    if (!step) return;

    setRaparigaPos({ gridX: step.gridX, gridY: step.gridY });
    setRaparigaSprite(npcPath("/rapariga/movingLeft.svg"));
    setRaparigaFacing("left");

    stepIndexRef.current++;
    moveTimerRef.current = setTimeout(walkLeaveRoute, step.ms);
  }, []);

  const unlockRaparigaPet = useCallback(() => {
    // Desbloqueia pet
    try {
      addPet?.("pet_rapariga");
    } catch {}
    try {
      setFlag("rapariga_unlocked" as FlagId);
    } catch {}

    // Mostra mensagem de agradecimento - escolhaBox já foi mostrada, agora fala "Obrigadaa!"
    setTalkingMessage("Obrigadaa! Vou te seguir!");
    setShowTalking(true);
    setTimeout(() => {
      setShowTalking(false);
      // Faz a pet seguir o jogador (lógica existente de pets)
      setRaparigaState("idle");
      isProcessingRef.current = false;
    }, 3000);
  }, [addPet, setFlag]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (checkTimerRef.current) clearInterval(checkTimerRef.current);
      if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
      if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
    };
  }, []);

  return {
    raparigaState,
    raparigaPos,
    raparigaSprite,
    raparigaFacing,
    showChoiceBox,
    showTalking,
    talkingMessage,
    handleChoice,
  };
}
