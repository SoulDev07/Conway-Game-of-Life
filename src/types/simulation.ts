export interface SimulationGridState {
  cells: Uint8Array;
  ages: Uint16Array;
  rows: number;
  cols: number;
  generation: number;
  aliveCount: number;
}

export type CellCoordinate = [number, number];

export interface GridSelection {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface RuleStrategy {
  id: string;
  name: string;
  notation: string; // e.g., "B3/S23"
  description: string;
  birth: readonly number[];
  survival: readonly number[];
  birthMask: number;
  survivalMask: number;
  evaluate: (isAlive: boolean, neighbors: number) => boolean;
}
