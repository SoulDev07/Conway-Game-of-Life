export interface GameBoardState {
  cells: Uint8Array;
  ages: Uint16Array;
  rows: number;
  cols: number;
  generation: number;
  aliveCount: number;
}

export type CellCoordinate = [number, number];
