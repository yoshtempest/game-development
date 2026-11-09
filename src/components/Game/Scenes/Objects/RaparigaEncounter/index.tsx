import { ChoiceBox } from "@/components/Game/Interactions/ChoiceBox";

type Props = {
  raparigaState:
    "idle" | "walking" | "eating" | "talking" | "waitingChoice" | "leaving";
  showChoiceBox: boolean;
  handleChoice: (choice: "dar denovo" | "não quero dar") => void;
};

export function RaparigaEncounter(props: Props) {
  const { raparigaState, showChoiceBox, handleChoice } = props;

  if (raparigaState === "idle") return null;

  return (
    <>
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
