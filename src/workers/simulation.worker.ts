import {
  createEmptyBoard,
  createRandomBoard,
  injectRandomEdgePattern,
  resizeBoard,
  stampPattern,
  stepSimulation,
} from "@/lib";
import type { GameBoardState, PresetPattern } from "@/types";

export type WorkerInMessage =
  | { type: "init"; rows: number; cols: number; speed: number }
  | { type: "start" }
  | { type: "stop" }
  | { type: "step" }
  | { type: "setSpeed"; speed: number }
  | { type: "setIdle"; idle: boolean }
  | { type: "clear" }
  | { type: "randomize"; density?: number }
  | { type: "toggleCell"; row: number; col: number; targetState: boolean }
  | { type: "stamp"; pattern: PresetPattern; row: number; col: number }
  | { type: "resize"; rows: number; cols: number };

export type WorkerOutMessage = {
  type: "tick";
  board: {
    cells: Uint8Array;
    ages: Uint16Array;
    rows: number;
    cols: number;
    generation: number;
    aliveCount: number;
  };
};

let board: GameBoardState = createEmptyBoard(16, 32);
let running = false;
let idleRunning = false;
let speed = 500;
let timerId: ReturnType<typeof setTimeout> | null = null;
let idleTimerId: ReturnType<typeof setTimeout> | null = null;

function postBoardUpdate() {
  self.postMessage({
    type: "tick",
    board: {
      cells: board.cells,
      ages: board.ages,
      rows: board.rows,
      cols: board.cols,
      generation: board.generation,
      aliveCount: board.aliveCount,
    },
  });
}

function runLoop() {
  if (!running) return;
  board = stepSimulation(board);
  postBoardUpdate();
  timerId = setTimeout(runLoop, speed);
}

function runIdleLoop() {
  if (!idleRunning) return;
  board = injectRandomEdgePattern(board);
  postBoardUpdate();
  const idleInterval = Math.max(1000, speed * 2);
  idleTimerId = setTimeout(runIdleLoop, idleInterval);
}

self.onmessage = (e: MessageEvent<WorkerInMessage>) => {
  const msg = e.data;
  switch (msg.type) {
    case "init":
      board = createEmptyBoard(msg.rows, msg.cols);
      speed = msg.speed;
      postBoardUpdate();
      break;

    case "start":
      if (!running) {
        running = true;
        runLoop();
      }
      break;

    case "stop":
      running = false;
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      break;

    case "step":
      board = stepSimulation(board);
      postBoardUpdate();
      break;

    case "setSpeed":
      speed = msg.speed;
      break;

    case "setIdle":
      idleRunning = msg.idle;
      if (idleRunning) {
        if (!running) {
          running = true;
          runLoop();
        }
        if (idleTimerId !== null) clearTimeout(idleTimerId);
        idleTimerId = setTimeout(runIdleLoop, Math.max(1000, speed * 2));
      } else {
        if (idleTimerId !== null) {
          clearTimeout(idleTimerId);
          idleTimerId = null;
        }
      }
      break;

    case "clear":
      running = false;
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      board = createEmptyBoard(board.rows, board.cols);
      postBoardUpdate();
      break;

    case "randomize":
      board = createRandomBoard(board.rows, board.cols, msg.density ?? 0.2);
      postBoardUpdate();
      break;

    case "toggleCell": {
      const idx = msg.row * board.cols + msg.col;
      if (idx >= 0 && idx < board.cells.length) {
        const currentState = board.cells[idx] === 1;
        if (currentState !== msg.targetState) {
          const nextCells = new Uint8Array(board.cells);
          const nextAges = new Uint16Array(board.ages);
          nextCells[idx] = msg.targetState ? 1 : 0;
          nextAges[idx] = msg.targetState ? 1 : 0;
          const nextAliveCount = board.aliveCount + (msg.targetState ? 1 : -1);
          board = {
            ...board,
            cells: nextCells,
            ages: nextAges,
            aliveCount: Math.max(0, nextAliveCount),
          };
          postBoardUpdate();
        }
      }
      break;
    }

    case "stamp":
      board = stampPattern(board, msg.pattern, msg.row, msg.col);
      postBoardUpdate();
      break;

    case "resize":
      if (board.rows !== msg.rows || board.cols !== msg.cols) {
        board =
          board.rows === 0 || board.cols === 0
            ? createEmptyBoard(msg.rows, msg.cols)
            : resizeBoard(board, msg.rows, msg.cols);
        postBoardUpdate();
      }
      break;
  }
};
