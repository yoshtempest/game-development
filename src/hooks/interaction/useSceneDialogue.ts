import { useMemo } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useQuests } from "@/contexts/QuestContext";
import { useFlags } from "@/contexts/FlagContext";
import { useInventory } from "@/contexts/InventoryContext";

/**
 * Hook que fornece o contexto de diálogo para cenas exploráveis.
 * 
 * Este hook centraliza a criação do `npcContext` que é usado por:
 * - `dialogueData` functions (para diálogos reativos a quests/items/flags)
 * - `npc.src` resolution (para sprites reativos ao estado do diálogo)
 * - `tileDialogues` lookup (para tiles de interação)
 * 
 * Use como base para o `dialogueData` de uma cena:
 * 
 * ```tsx
 * // Em scenes/<loc>/<id>/dialogue.ts
 * export function getMySceneDialogue(context: DialogueContext): Dialogue[] {
 *   const { quests, items, flags, character, lastPage } = context;
 *   // Retorna diálogos condicionais baseados em state
 *   if (hasQuest(quests, "mineradora")) return [["npc", "A mina já foi explorada!"]];
 *   return [];
 * }
 * 
 * // Em scenes/<loc>/<id>/scene.ts
 * import { getMySceneDialogue } from "./dialogue";
 * 
 * export const myScene: SceneConfig = {
 *   // ...
 *   dialogueData: getMySceneDialogue, // função reativa
 *   // ou: dialogueData: [], // estático
 * };
 * ```
 * 
 * @param dialogueData - Array de diálogos estático ou função que recebe o contexto e retorna diálogos
 * @returns Objeto com `resolvedDialogueData` (diálogos resolvidos) e `npcContext` (contexto para resolução de sprites)
 */
export function useSceneDialogue(
  dialogueData:
    | Dialogue[]
    | ((context: DialogueContext) => Dialogue[]),
) {
  const { player } = usePlayer();
  const { quests } = useQuests();
  const { flags } = useFlags();
  const { items } = useInventory();

  // Contexto estável que não muda entre renders desnecessariamente
  const npcContext = useMemo(
    () => ({
      quests,
      items: items.map((item) => ({ id: item.id })),
      flags,
      character: player.character,
      lastPage: undefined as LastPage | undefined,
    }),
    [quests, items, flags, player.character],
  );

  // Se dialogueData for função, chama com o contexto; caso contrário, usa direto
  const resolvedDialogueData = useMemo(() => {
    if (typeof dialogueData === "function") {
      return dialogueData(npcContext);
    }
    return dialogueData;
  }, [dialogueData, npcContext]);

  return {
    resolvedDialogueData,
    npcContext,
  };
}