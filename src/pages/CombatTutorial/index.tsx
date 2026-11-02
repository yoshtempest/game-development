import { useState } from "react";
import { useCombatTasks } from "@/hooks/tutorial/useCombatTasks";
import { useCutscene } from "@/hooks/interaction/cutscene/useCutscene";
import { npcPath } from "@/utils/paths";
import Talking from "@/components/Game/Interactions/Talking";
import { ChoiceBox } from "@/components/Game/Interactions/ChoiceBox";
import { BattleScene } from "@/components/Game/Scenes/Battle";
import { BattleProviders } from "@/components/Game/Battle/BattleProviders";
import { combatTutorialDialogue } from "@/data/dialogues/combatTutorial/one";
import { TASKS } from "@/gameRules/tutorial/combatTasks";
import KickBack from "/assets/songs/background/battle/KickBack.mp3";
import { sceneBackgrounds } from "@/data/scene/background";
import styles from "./styles.module.css";

export default function CombatTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);

  const cutscene = useCutscene({
    dialogue: combatTutorialDialogue,
    onFinish: () => setShowTutorial(true),
  });

  if (!showTutorial) {
    const dialogue = cutscene.dialogue;
    return (
      <div
        className="Master"
        style={{ backgroundImage: `url(${sceneBackgrounds.CombatTutorial})` }}
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
      </div>
    );
  }

  return (
    <BattleProviders>
      <BattleScene
        npcType="dummy"
        redirectTo="/home"
        victoryDescription="Você derrotou o boneco de treino!"
        background={sceneBackgrounds.CombatTutorial}
        audioSrc={KickBack}
      >
        <CombatTutorialTasks />
      </BattleScene>
    </BattleProviders>
  );
}

function CombatTutorialTasks() {
  const { instruction, getTaskStatus } = useCombatTasks();

  return (
    <div className={styles.overlay}>
      <div className={styles.taskBox}>
        <img className={styles.image} src={npcPath("/surica/default.svg")} />
        <p className={styles.taskText}>{instruction.text}</p>
      </div>

      <div className={styles.steps}>
        {TASKS.map((t) => {
          const status = getTaskStatus(t);
          return (
            <div
              key={t}
              className={`${styles.dot} ${status === "done" ? styles.dotDone : ""} ${status === "active" ? styles.dotActive : ""}`}
            />
          );
        })}
      </div>
    </div>
  );
}
