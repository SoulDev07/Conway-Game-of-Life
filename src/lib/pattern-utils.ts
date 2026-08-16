import { PATTERN_PRESETS } from "@/constants";
import type { GameBoardState, PresetPattern } from "@/types";

export function stampPattern(
  board: GameBoardState,
  pattern: PresetPattern,
  startRow: number,
  startCol: number,
): GameBoardState {
  const cells = new Uint8Array(board.cells);
  const ages = new Uint16Array(board.ages);
  let aliveCount = board.aliveCount;

  for (const [dr, dc] of pattern.grid) {
    const r = (startRow + dr + board.rows) % board.rows;
    const c = (startCol + dc + board.cols) % board.cols;
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
  let maxR = 0;
  let maxC = 0;
  for (const [r, c] of pattern.grid) {
    if (r > maxR) maxR = r;
    if (c > maxC) maxC = c;
  }

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

  return stampPattern(board, pattern, startRow, startCol);
}
