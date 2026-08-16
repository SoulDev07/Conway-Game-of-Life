import type { GameBoardState } from "@/types";

export function createEmptyBoard(rows: number, cols: number): GameBoardState {
  return {
    cells: new Uint8Array(rows * cols),
    ages: new Uint16Array(rows * cols),
    rows,
    cols,
    generation: 0,
    aliveCount: 0,
  };
}

export function createRandomBoard(rows: number, cols: number, density: number): GameBoardState {
  const size = rows * cols;
  const cells = new Uint8Array(size);
  const ages = new Uint16Array(size);
  let aliveCount = 0;

  for (let i = 0; i < size; i++) {
    if (Math.random() < density) {
      cells[i] = 1;
      ages[i] = 1;
      aliveCount++;
    }
  }

  return {
    cells,
    ages,
    rows,
    cols,
    generation: 0,
    aliveCount,
  };
}

export function stepSimulation(current: GameBoardState): GameBoardState {
  const { cells, ages, rows, cols, generation } = current;
  const size = rows * cols;
  const nextCells = new Uint8Array(size);
  const nextAges = new Uint16Array(size);
  let nextAliveCount = 0;

  for (let r = 0; r < rows; r++) {
    const rOffset = r * cols;
    const rPrev = ((r - 1 + rows) % rows) * cols;
    const rNext = ((r + 1) % rows) * cols;

    for (let c = 0; c < cols; c++) {
      const cPrev = (c - 1 + cols) % cols;
      const cNext = (c + 1) % cols;

      const neighbors =
        cells[rPrev + cPrev] +
        cells[rPrev + c] +
        cells[rPrev + cNext] +
        cells[rOffset + cPrev] +
        cells[rOffset + cNext] +
        cells[rNext + cPrev] +
        cells[rNext + c] +
        cells[rNext + cNext];

      const idx = rOffset + c;
      const isAlive = cells[idx] === 1;

      if (isAlive && (neighbors === 2 || neighbors === 3)) {
        nextCells[idx] = 1;
        nextAges[idx] = Math.min(65535, ages[idx] + 1);
        nextAliveCount++;
      } else if (!isAlive && neighbors === 3) {
        nextCells[idx] = 1;
        nextAges[idx] = 1;
        nextAliveCount++;
      }
    }
  }

  return {
    cells: nextCells,
    ages: nextAges,
    rows,
    cols,
    generation: generation + 1,
    aliveCount: nextAliveCount,
  };
}

export function resizeBoard(
  oldBoard: GameBoardState,
  newRows: number,
  newCols: number,
): GameBoardState {
  const newCells = new Uint8Array(newRows * newCols);
  const newAges = new Uint16Array(newRows * newCols);
  let aliveCount = 0;

  const minRows = Math.min(oldBoard.rows, newRows);
  const minCols = Math.min(oldBoard.cols, newCols);

  for (let r = 0; r < minRows; r++) {
    for (let c = 0; c < minCols; c++) {
      const oldIdx = r * oldBoard.cols + c;
      const newIdx = r * newCols + c;
      if (oldBoard.cells[oldIdx]) {
        newCells[newIdx] = 1;
        newAges[newIdx] = oldBoard.ages[oldIdx];
        aliveCount++;
      }
    }
  }

  return {
    cells: newCells,
    ages: newAges,
    rows: newRows,
    cols: newCols,
    generation: oldBoard.generation,
    aliveCount,
  };
}
