export type SimulationEvents = {
  tick: { generation: number; aliveCount: number };
  ruleChange: { ruleId: string };
  speedChange: { speed: number };
  runningChange: { running: boolean };
};

export class SimulationEventBus extends EventTarget {
  emit<K extends keyof SimulationEvents>(event: K, detail: SimulationEvents[K]): void {
    this.dispatchEvent(new CustomEvent(event as string, { detail }));
  }

  on<K extends keyof SimulationEvents>(
    event: K,
    listener: (data: SimulationEvents[K]) => void,
    options?: AddEventListenerOptions,
  ): () => void {
    const handler = (e: Event) => {
      listener((e as CustomEvent<SimulationEvents[K]>).detail);
    };
    this.addEventListener(event as string, handler, options);
    return () => this.removeEventListener(event as string, handler, options);
  }
}

export const simulationEventBus = new SimulationEventBus();
