import type { NavigateFunction } from "react-router";
import { SFX_KEY } from "@/data/storageKeys";

/** Portas injetadas para o service afetar o mundo sem conhecer React. */
export type SceneEventContext = {
  navigate: NavigateFunction;
  location: { pathname: LastPage; state?: { from?: LastPage } };

  setShowClassModal?: (v: boolean) => void;

  // flags
  setFlag?: (flag: FlagId) => void;
  hasFlag?: (flag: FlagId) => boolean;

  // quests
  progressQuest?: (id: QuestId, value: number) => void;
  giveQuest?: (quest: QuestId) => void;
  hasQuest?: (questId: QuestId) => boolean;

  // inventory
  addItem?: (item: ItemId) => void;
  removeItem?: (itemId: ItemId) => void;
  /** Entrega item a NPC: remove do inventário e exibe toast. */
  giveItem?: (itemId: ItemId, npcName?: string) => void;
  /** NPC entrega item ao jogador: adiciona ao inventário e exibe toast com imagem do NPC. */
  npcGiveItem?: (itemId: ItemId, npcName: string, npcImage?: string) => void;
  hasItem?: (itemId: ItemId) => boolean;

  // tombstone
  prepareTombstoneSpawn?: (locationId: string) => void;
};

type SceneCondition = Extract<SceneEvent, { type: "conditional" }>["condition"];

function defaultSfxVolumeReader(): number {
  try {
    const raw = localStorage.getItem(SFX_KEY);
    return raw !== null ? Number(raw) : 50;
  } catch {
    return 50;
  }
}

/**
 * Motor de eventos de cena. Cada instância possui seu próprio pool de
 * áudio e rastreia os timers que criou — chame `dispose()` ao sair da
 * cena para não vazar timeouts/áudio.
 */
export class SceneEventService {
  private readonly ctx: SceneEventContext;
  private readonly getSfxVolume: () => number;
  private readonly timers: ReturnType<typeof setTimeout>[] = [];
  private readonly sfxPool = new Map<string, HTMLAudioElement>();
  private disposed = false;

  constructor(
    ctx: SceneEventContext,
    getSfxVolume: () => number = defaultSfxVolumeReader,
  ) {
    this.ctx = ctx;
    this.getSfxVolume = getSfxVolume;
  }

  run(events: SceneEvent[] | undefined): void {
    if (!events) return;

    for (const event of events) {
      if (this.disposed) return;

      switch (event.type) {
        case "conditional":
          this.run(
            this.evaluateCondition(event.condition) ? event.then : event.else,
          );
          break;

        case "openModal":
          if (event.modal === "class") {
            this.ctx.setShowClassModal?.(true);
          }
          break;

        case "playSound":
          this.playSfx(event.src, event.volume);
          break;

        case "navigate":
          this.handleNavigate(event);
          // navegar encerra a sequência
          return;

        case "setFlag":
          this.ctx.setFlag?.(event.flagId);
          break;

        case "progressQuest":
          this.ctx.progressQuest?.(event.id, event.value);
          break;

        case "giveQuest":
          this.ctx.giveQuest?.(event.questId);
          break;

        case "addItem":
          this.ctx.addItem?.(event.itemId);
          break;

        case "removeItem":
          this.ctx.removeItem?.(event.itemId);
          break;

        case "giveItem":
          this.ctx.giveItem?.(event.itemId, event.npcName);
          break;

        case "npcGiveItem":
          this.ctx.npcGiveItem?.(event.itemId, event.npcName, event.npcImage);
          break;

        case "prepareTombstone":
          this.ctx.prepareTombstoneSpawn?.(event.locationId);
          break;

        case "log":
          console.log(event.message);
          break;
      }
    }
  }

  /** Cancela timers pendentes e pausa o áudio do pool. */
  dispose(): void {
    this.disposed = true;
    this.timers.forEach(clearTimeout);
    this.timers.length = 0;

    this.sfxPool.forEach((audio) => audio.pause());
    this.sfxPool.clear();
  }

  private evaluateCondition(condition: SceneCondition): boolean {
    const {
      hasItem,
      notHasItem,
      hasQuest,
      notHasQuest,
      hasFlag,
      notHasFlag,
      lastPage,
      notLastPage,
    } = condition;

    const lastPageValue = this.ctx.location.state?.from;

    return (
      (!hasItem || !!this.ctx.hasItem?.(hasItem)) &&
      (!notHasItem || !this.ctx.hasItem?.(notHasItem)) &&
      (!hasQuest || !!this.ctx.hasQuest?.(hasQuest)) &&
      (!notHasQuest || !this.ctx.hasQuest?.(notHasQuest)) &&
      (!hasFlag || !!this.ctx.hasFlag?.(hasFlag)) &&
      (!notHasFlag || !this.ctx.hasFlag?.(notHasFlag)) &&
      (!lastPage || lastPageValue === lastPage) &&
      (!notLastPage || lastPageValue !== notLastPage)
    );
  }

  /**
   * Toca um SFX do pool da cena.
   *
   * O volume é clampado em [0, 1]: `HTMLMediaElement.volume` lança
   * `IndexSizeError` fora dessa faixa, e nada valida o `volume` que vem
   * do evento nem o valor de SFX lido do storage.
   */
  private playSfx(src: string, volume?: number): void {
    let audio = this.sfxPool.get(src);
    if (!audio) {
      audio = new Audio(src);
      this.sfxPool.set(src, audio);
    }
    audio.pause();
    audio.currentTime = 0;

    const sfxVol = this.getSfxVolume();
    const requested = (sfxVol / 100) * (volume ?? 1);
    audio.volume = Number.isFinite(requested)
      ? Math.min(1, Math.max(0, requested))
      : 0;
    audio.play().catch(() => {});
  }

  private handleNavigate(
    event: Extract<SceneEvent, { type: "navigate" }>,
  ): void {
    const doNav = () =>
      this.ctx.navigate(event.to, {
        state: { from: this.ctx.location.pathname },
      });

    if (event.delay) {
      const timer = setTimeout(() => void doNav(), event.delay);
      this.timers.push(timer);
    } else {
      void doNav();
    }
  }
}
