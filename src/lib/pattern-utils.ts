import { PATTERN_PRESETS } from "@/constants";
import type { GameBoardState, PresetPattern } from "@/types";

export function getPatternBounds(pattern: PresetPattern) {
  let minR = Number.POSITIVE_INFINITY;
  let maxR = Number.NEGATIVE_INFINITY;
  let minC = Number.POSITIVE_INFINITY;
  let maxC = Number.NEGATIVE_INFINITY;

  for (const [r, c] of pattern.grid) {
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
    centerOffsetR: Math.floor((maxR - minR) / 2) + minR,
    centerOffsetC: Math.floor((maxC - minC) / 2) + minC,
  };
}

export function stampPattern(
  board: GameBoardState,
  pattern: PresetPattern,
  startRow: number,
  startCol: number,
  centered = true,
  inPlace = false,
): GameBoardState {
  const cells = inPlace ? board.cells : new Uint8Array(board.cells);
  const ages = inPlace ? board.ages : new Uint16Array(board.ages);
  let aliveCount = board.aliveCount;

  let offsetR = startRow;
  let offsetC = startCol;

  if (centered) {
    const { centerOffsetR, centerOffsetC } = getPatternBounds(pattern);
    offsetR = startRow - centerOffsetR;
    offsetC = startCol - centerOffsetC;
  }

  for (const [dr, dc] of pattern.grid) {
    const r = (offsetR + dr + board.rows * 100) % board.rows;
    const c = (offsetC + dc + board.cols * 100) % board.cols;
    const idx = r * board.cols + c;
    if (cells[idx] === 0) {
      cells[idx] = 1;
      ages[idx] = 1;
      aliveCount++;
    }
  }

  return {
    ...board,
    cells,
    ages,
    aliveCount,
  };
}

export function injectRandomEdgePattern(board: GameBoardState): GameBoardState {
  const pattern = PATTERN_PRESETS[Math.floor(Math.random() * PATTERN_PRESETS.length)];
  const { maxR, maxC } = getPatternBounds(pattern);

  const edge = Math.floor(Math.random() * 4);
  let startRow = 0;
  let startCol = 0;

  switch (edge) {
    case 0:
      startRow = 1;
      startCol = Math.floor(Math.random() * Math.max(1, board.cols - maxC - 2));
      break;
    case 1:
      startRow = Math.max(1, board.rows - maxR - 2);
      startCol = Math.floor(Math.random() * Math.max(1, board.cols - maxC - 2));
      break;
    case 2:
      startRow = Math.floor(Math.random() * Math.max(1, board.rows - maxR - 2));
      startCol = 1;
      break;
    case 3:
      startRow = Math.floor(Math.random() * Math.max(1, board.rows - maxR - 2));
      startCol = Math.max(1, board.cols - maxC - 2);
      break;
  }

  return stampPattern(board, pattern, startRow, startCol, false);
}
