import type { CellCoordinate, GridSelection, SimulationGridState } from "@/types";

export interface BoundingBox {
  minR: number;
  maxR: number;
  minC: number;
  maxC: number;
  width: number;
  height: number;
}

export function getSelectionBounds(selection: GridSelection): BoundingBox {
  const minR = Math.min(selection.startRow, selection.endRow);
  const maxR = Math.max(selection.startRow, selection.endRow);
  const minC = Math.min(selection.startCol, selection.endCol);
  const maxC = Math.max(selection.startCol, selection.endCol);

  return {
    minR,
    maxR,
    minC,
    maxC,
    width: maxC - minC + 1,
    height: maxR - minR + 1,
  };
}

export function extractSelectionCells(
  grid: SimulationGridState,
  selection: GridSelection,
): CellCoordinate[] {
  const { minR, maxR, minC, maxC } = getSelectionBounds(selection);
  const result: CellCoordinate[] = [];

  const rowStart = Math.max(0, minR);
  const rowEnd = Math.min(grid.rows - 1, maxR);
  const colStart = Math.max(0, minC);
  const colEnd = Math.min(grid.cols - 1, maxC);

  for (let r = rowStart; r <= rowEnd; r++) {
    const rowOffset = r * grid.cols;
    for (let c = colStart; c <= colEnd; c++) {
      if (grid.cells[rowOffset + c] === 1) {
        result.push([r, c]);
      }
    }
  }

  return result;
}

export function extractAllLiveCells(grid: SimulationGridState): CellCoordinate[] {
  const result: CellCoordinate[] = [];
  const { rows, cols, cells } = grid;

  for (let r = 0; r < rows; r++) {
    const rowOffset = r * cols;
    for (let c = 0; c < cols; c++) {
      if (cells[rowOffset + c] === 1) {
        result.push([r, c]);
      }
    }
  }

  return result;
}

export function getCoordinatesBounds(coords: CellCoordinate[]): BoundingBox {
  if (coords.length === 0) {
    return { minR: 0, maxR: 0, minC: 0, maxC: 0, width: 0, height: 0 };
  }

  let minR = Number.POSITIVE_INFINITY;
  let maxR = Number.NEGATIVE_INFINITY;
  let minC = Number.POSITIVE_INFINITY;
  let maxC = Number.NEGATIVE_INFINITY;

  for (const [r, c] of coords) {
    if (r < minR) minR = r;
    if (r > maxR) maxR = r;
    if (c < minC) minC = c;
    if (c > maxC) maxC = c;
  }

  return {
    minR,
    maxR,
    minC,
    maxC,
    width: maxC - minC + 1,
    height: maxR - minR + 1,
  };
}

export function generateRLE(coords: CellCoordinate[], name = "Pattern"): string {
  if (coords.length === 0) {
    return `#N ${name}\n#O Conway Game of Life\nx = 0, y = 0, rule = B3/S23\n!`;
  }

  const { minR, minC, width, height } = getCoordinatesBounds(coords);

  const liveCoords = new Set<string>();
  const rowMaxCol = new Map<number, number>();

  for (const [r, c] of coords) {
    const relR = r - minR;
    const relC = c - minC;
    liveCoords.add(`${relR},${relC}`);
    const currMax = rowMaxCol.get(relR) ?? -1;
    if (relC > currMax) {
      rowMaxCol.set(relR, relC);
    }
  }

  const headerLines: string[] = [
    `#N ${name.trim() || "Pattern"}`,
    "#O Conway Game of Life",
    `x = ${width}, y = ${height}, rule = B3/S23`,
  ];

  let bodyTokens = "";
  let emptyRowsCount = 0;

  for (let r = 0; r < height; r++) {
    const maxColInRow = rowMaxCol.get(r);

    if (maxColInRow === undefined) {
      emptyRowsCount++;
      continue;
    }

    if (emptyRowsCount > 0) {
      bodyTokens += emptyRowsCount === 1 ? "$" : `${emptyRowsCount}$`;
      emptyRowsCount = 0;
    }

    let currentCol = 0;
    while (currentCol <= maxColInRow) {
      const isAlive = liveCoords.has(`${r},${currentCol}`);
      const stateChar = isAlive ? "o" : "b";
      let runLength = 1;

      while (
        currentCol + runLength <= maxColInRow &&
        liveCoords.has(`${r},${currentCol + runLength}`) === isAlive
      ) {
        runLength++;
      }

      bodyTokens += runLength === 1 ? stateChar : `${runLength}${stateChar}`;
      currentCol += runLength;
    }

    bodyTokens += "$";
  }

  if (bodyTokens.endsWith("$")) {
    bodyTokens = bodyTokens.slice(0, -1);
  }
  bodyTokens += "!";

  const wrappedBodyLines: string[] = [];
  for (let i = 0; i < bodyTokens.length; i += 70) {
    wrappedBodyLines.push(bodyTokens.slice(i, i + 70));
  }

  return `${headerLines.join("\n")}\n${wrappedBodyLines.join("\n")}\n`;
}

export function generatePlaintext(coords: CellCoordinate[], name = "Pattern"): string {
  if (coords.length === 0) {
    return `!Name: ${name}\n! Conway Game of Life\n`;
  }

  const { minR, minC, width, height } = getCoordinatesBounds(coords);

  const liveCoords = new Set<string>();
  for (const [r, c] of coords) {
    liveCoords.add(`${r - minR},${c - minC}`);
  }

  const lines: string[] = [`!Name: ${name}`, "! Conway Game of Life"];

  for (let r = 0; r < height; r++) {
    let rowStr = "";
    for (let c = 0; c < width; c++) {
      rowStr += liveCoords.has(`${r},${c}`) ? "O" : ".";
    }
    lines.push(rowStr);
  }

  return `${lines.join("\n")}\n`;
}
