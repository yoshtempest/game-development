import { useRef, useEffect } from "react";
import { SendHorizontal } from "lucide-react";
import Talking from "@/components/Game/Interactions/Talking";
import { ChoiceBox } from "@/components/Game/Interactions/ChoiceBox";
import styles from "./styles.module.css";
import SOS from "/assets/songs/background/battle/SOSFromEarth.m4a";
import { useBackgroundAudio } from "@/hooks/audio/useBackgroundAudio";
import { useNavigate } from "react-router";
import { useCutscene } from "@/hooks/interaction/useCutscene";
import { useSansTalking } from "@/hooks/interaction/useSansTalking";
import { tutorialDialogue } from "@/data/dialogues/tutorial";

import { useTutorialFlow } from "@/hooks/tutorial/useTutorialFlow";
import { useNameInput } from "@/hooks/tutorial/useNameInput";
import { useQuestActions } from "@/hooks/quest/useQuestActions";
import { QUESTS } from "@/data/quests";
import { sceneBackgrounds } from "@/data/scene/background";
import { useNavbar } from "@/contexts/NavbarContext";

export default function Tutorial() {
  const navigate = useNavigate();
  const { play: playSansTalking } = useSansTalking(false);
  const { giveQuest } = useQuestActions();
  const { closeNavbar } = useNavbar();

  const flow = useTutorialFlow();
  const inputRef = useRef<HTMLInputElement>(null);

  const nameInput = useNameInput(() => {
    flow.closeNameInput();
    cutscene.next();
  });

  useBackgroundAudio(SOS);

  useEffect(() => {
    closeNavbar();
  }, [closeNavbar]);

  const cutscene = useCutscene({
    dialogue: tutorialDialogue,
    playAudio: playSansTalking,
    onFinish: () => {
      giveQuest(QUESTS.jomasio_investigate);
      void navigate("/combatTutorial");
    },
    onBeforeNext: (dialogue) => {
      if (dialogue.message.includes("qual é seu nome")) {
        if (!flow.showNameInput) {
          flow.openNameInput();
          return false;
        }
      }

      if (dialogue.message.includes("Marshadow ou Drika")) {
        if (!flow.showGenderChoice) {
          flow.openGenderChoice();
          return false;
        }
      }

      if (flow.showNameInput || flow.showGenderChoice) return false;

      return true;
    },
  });

  const dialogue = cutscene.dialogue;

  return (
    <div
      className="Master"
      style={{ backgroundImage: `url(${sceneBackgrounds.Tutorial})` }}
    >
      {dialogue && (
        <Talking
          name={dialogue.name}
          message={dialogue.message}
          src={dialogue.src}
        />
      )}

      {cutscene.isSkipPromptOpen && (
        <ChoiceBox
          prompt="Tem certeza que deseja pular a cutscene?"
          options={["Sim", "Não"]}
          onSelect={(index) =>
            index === 0 ? cutscene.confirmSkip() : cutscene.cancelSkip()
          }
        />
      )}

      {flow.showGenderChoice && (
        <ChoiceBox
          prompt="Você é macho ou fêmea?"
          options={["Macho", "Fêmea"]}
          onSelect={(index) => {
            const characterId = index === 0 ? "marshadow" : "drika";
            flow.chooseGender(characterId);
            cutscene.next();
          }}
        />
      )}

      {flow.showNameInput && (
        <div className={`overlay ${styles.overlay}`}>
          <div>
            <h1>Nome de usuário</h1>

            <div className={styles.relative}>
              <input
                ref={inputRef}
                value={nameInput.playerName}
                onChange={(e) => nameInput.setPlayerName(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();

                  if (e.key === "Enter") {
                    nameInput.submit();
                  }
                }}
              />

              <button
                type="button"
                className={styles.sendButton}
                aria-label="Enviar nome"
                onMouseDown={(e) => e.preventDefault()}
                onClick={nameInput.submit}
              >
                <SendHorizontal color="black" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
