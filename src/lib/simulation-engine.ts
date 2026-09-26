import type { RuleStrategy, SimulationGridState } from "@/types";
import { CONWAY_RULE } from "./rules";

export function createEmptyGrid(
  rows: number,
  cols: number,
  customCells?: Uint8Array,
  customAges?: Uint16Array,
): SimulationGridState {
  const size = rows * cols;
  const cells = customCells && customCells.length === size ? customCells : new Uint8Array(size);
  const ages = customAges && customAges.length === size ? customAges : new Uint16Array(size);
  cells.fill(0);
  ages.fill(0);
  return {
    cells,
    ages,
    rows,
    cols,
    generation: 0,
    aliveCount: 0,
  };
}

export function createRandomGrid(
  rows: number,
  cols: number,
  density: number,
  customCells?: Uint8Array,
  customAges?: Uint16Array,
): SimulationGridState {
  const size = rows * cols;
  const cells = customCells && customCells.length === size ? customCells : new Uint8Array(size);
  const ages = customAges && customAges.length === size ? customAges : new Uint16Array(size);
  let aliveCount = 0;

  for (let i = 0; i < size; i++) {
    if (Math.random() < density) {
      cells[i] = 1;
      ages[i] = 1;
      aliveCount++;
    } else {
      cells[i] = 0;
      ages[i] = 0;
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

export function stepSimulation(
  current: SimulationGridState,
  targetCells?: Uint8Array,
  targetAges?: Uint16Array,
  rule: RuleStrategy = CONWAY_RULE,
  wrapEdges = true,
): SimulationGridState {
  const { cells, ages, rows, cols, generation } = current;
  const size = rows * cols;
  const nextCells = targetCells && targetCells.length === size ? targetCells : new Uint8Array(size);
  const nextAges = targetAges && targetAges.length === size ? targetAges : new Uint16Array(size);
  let nextAliveCount = 0;
  const { birthMask, survivalMask } = rule;

  for (let r = 0; r < rows; r++) {
    const rOffset = r * cols;
    const hasPrevRow = wrapEdges || r > 0;
    const hasNextRow = wrapEdges || r < rows - 1;
    const rPrev = hasPrevRow ? ((r - 1 + rows) % rows) * cols : 0;
    const rNext = hasNextRow ? ((r + 1) % rows) * cols : 0;

    for (let c = 0; c < cols; c++) {
      const hasPrevCol = wrapEdges || c > 0;
      const hasNextCol = wrapEdges || c < cols - 1;
      const cPrev = hasPrevCol ? (c - 1 + cols) % cols : 0;
      const cNext = hasNextCol ? (c + 1) % cols : 0;

      let neighbors = 0;
      if (hasPrevRow) {
        if (hasPrevCol) neighbors += cells[rPrev + cPrev];
        neighbors += cells[rPrev + c];
        if (hasNextCol) neighbors += cells[rPrev + cNext];
      }
      if (hasPrevCol) neighbors += cells[rOffset + cPrev];
      if (hasNextCol) neighbors += cells[rOffset + cNext];
      if (hasNextRow) {
        if (hasPrevCol) neighbors += cells[rNext + cPrev];
        neighbors += cells[rNext + c];
        if (hasNextCol) neighbors += cells[rNext + cNext];
      }

      const idx = rOffset + c;
      const isAlive = cells[idx] === 1;
      const neighborBit = 1 << neighbors;
      const willLive = isAlive
        ? (survivalMask & neighborBit) !== 0
        : (birthMask & neighborBit) !== 0;

      if (willLive) {
        nextCells[idx] = 1;
        nextAges[idx] = isAlive ? Math.min(65535, ages[idx] + 1) : 1;
        nextAliveCount++;
      } else {
        nextCells[idx] = 0;
        nextAges[idx] = 0;
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

export function resizeGrid(
  oldGrid: SimulationGridState,
  newRows: number,
  newCols: number,
  targetCells?: Uint8Array,
  targetAges?: Uint16Array,
): SimulationGridState {
  const newSize = newRows * newCols;
  const newCells =
    targetCells && targetCells.length === newSize ? targetCells : new Uint8Array(newSize);
  const newAges =
    targetAges && targetAges.length === newSize ? targetAges : new Uint16Array(newSize);
  newCells.fill(0);
  newAges.fill(0);
  let aliveCount = 0;

  // If the grid was just loaded with a pattern and has not evolved yet (generation === 0),
  // re-center the pattern nicely in the new canvas dimensions instead of sticking to top-left.
  if (oldGrid.generation === 0 && oldGrid.aliveCount > 0) {
    let minR = Number.POSITIVE_INFINITY;
    let maxR = Number.NEGATIVE_INFINITY;
    let minC = Number.POSITIVE_INFINITY;
    let maxC = Number.NEGATIVE_INFINITY;

    for (let r = 0; r < oldGrid.rows; r++) {
      const rOffset = r * oldGrid.cols;
      for (let c = 0; c < oldGrid.cols; c++) {
        if (oldGrid.cells[rOffset + c]) {
          if (r < minR) minR = r;
          if (r > maxR) maxR = r;
          if (c < minC) minC = c;
          if (c > maxC) maxC = c;
        }
      }
    }

    const pHeight = maxR - minR + 1;
    const pWidth = maxC - minC + 1;
    const startR = Math.floor((newRows - pHeight) / 2);
    const startC = Math.floor((newCols - pWidth) / 2);

    for (let r = minR; r <= maxR; r++) {
      const oldOffset = r * oldGrid.cols;
      for (let c = minC; c <= maxC; c++) {
        if (oldGrid.cells[oldOffset + c]) {
          const destR = startR + (r - minR);
          const destC = startC + (c - minC);
          if (destR >= 0 && destR < newRows && destC >= 0 && destC < newCols) {
            const newIdx = destR * newCols + destC;
            newCells[newIdx] = 1;
            newAges[newIdx] = oldGrid.ages[oldOffset + c] || 1;
            aliveCount++;
          }
        }
      }
    }
  } else {
    const minRows = Math.min(oldGrid.rows, newRows);
    const minCols = Math.min(oldGrid.cols, newCols);

    for (let r = 0; r < minRows; r++) {
      for (let c = 0; c < minCols; c++) {
        const oldIdx = r * oldGrid.cols + c;
        const newIdx = r * newCols + c;
        if (oldGrid.cells[oldIdx]) {
          newCells[newIdx] = 1;
          newAges[newIdx] = oldGrid.ages[oldIdx];
          aliveCount++;
        }
      }
    }
  }

  return {
    cells: newCells,
    ages: newAges,
    rows: newRows,
    cols: newCols,
    generation: oldGrid.generation,
    aliveCount,
  };
}
