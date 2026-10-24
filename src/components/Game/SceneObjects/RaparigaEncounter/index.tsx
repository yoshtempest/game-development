import { useFoodPlateEncounter } from "@/hooks/scene/useFoodPlateEncounter";
import { npcPath } from "@/utils/paths";
import { ChoiceBox } from "@/components/Game/Interactions/ChoiceBox";
import Talking from "@/components/Game/Interactions/Talking";

export function RaparigaEncounter() {
  const {
    raparigaState,
    raparigaPos,
    raparigaSprite,
    showChoiceBox,
    showTalking,
    talkingMessage,
    handleChoice,
  } = useFoodPlateEncounter();

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

      <div
        style={{
          position: "absolute",
          left: `${raparigaPos.gridX * 48}px`,
          top: `${raparigaPos.gridY * 48}px`,
          zIndex: 50,
          pointerEvents: "none",
        }}
      >
        <img
          src={raparigaSprite}
          alt="Rapariga"
          style={{
            width: "76px",
            height: "76px",
            imageRendering: "pixelated",
          }}
        />
      </div>
    </>
  );
}
