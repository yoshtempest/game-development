import { npcPath } from "@/utils/paths";
import { ChoiceBox } from "@/components/Game/Interactions/ChoiceBox";
import Talking from "@/components/Game/Interactions/Talking";

type Props = {
  raparigaState: "idle" | "walking" | "eating" | "waitingChoice" | "leaving";
  showChoiceBox: boolean;
  showTalking: boolean;
  talkingMessage: string;
  handleChoice: (choice: "dar denovo" | "não quero dar") => void;
};

export function RaparigaEncounter(props: Props) {
  const {
    raparigaState,
    showChoiceBox,
    showTalking,
    talkingMessage,
    handleChoice,
  } = props;

  if (raparigaState === "idle") return null;

  return (
    <>
      {showTalking && (
        <Talking
          name="Rapariga"
          message={talkingMessage}
          src={npcPath("/rapariga/happy.svg")}
        />
      )}

      {showChoiceBox && (
        <ChoiceBox
          prompt="A Rapariga quer mais comida... O que você faz?"
          options={["dar denovo", "não quero dar"]}
          onSelect={(index) =>
            handleChoice(index === 0 ? "dar denovo" : "não quero dar")
          }
        />
      )}

      {/* Rapariga agora é renderizada como NPC na cena (sceneWithRapariga) */}
    </>
  );
}