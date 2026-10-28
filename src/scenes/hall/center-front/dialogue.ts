import { centerFrontDialogue } from "@/data/dialogues/hall/centerFront/one";
import { centerFrontTwoDialogue } from "@/data/dialogues/hall/centerFront/two";
import { centerFrontThreeDialogue } from "@/data/dialogues/hall/centerFront/three";
import { centerFrontFourDialogue } from "@/data/dialogues/hall/centerFront/four";

import { hasQuest, playerCharacter } from "@/scenes/shared/helpers";

export const getCenterFrontDialogue = ({
  quests,
  character,
}: {
  quests: { id: string }[];
  character: CharacterId;
}) => {
  if (
    playerCharacter(character, "marshadow") &&
    !hasQuest(quests, "save_samurion") &&
    !hasQuest(quests, "save_ematron")
  ) {
    return centerFrontFourDialogue;
  }

  if (hasQuest(quests, "save_ematron")) {
    return centerFrontThreeDialogue;
  }

  if (hasQuest(quests, "save_samurion") && !hasQuest(quests, "save_ematron")) {
    return centerFrontTwoDialogue;
  }

  return centerFrontDialogue;
};
