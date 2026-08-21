import {
  createRandomBoard,
  injectRandomEdgePattern,
  resizeBoard,
  stampPattern,
  stepSimulation,
} from "@/lib";
import type { GameBoardState, WorkerInMessage } from "@/types";

let rows = 16;
let cols = 32;
let generation = 0;
let aliveCount = 0;

let frontCells: Uint8Array = new Uint8Array(rows * cols);
let frontAges: Uint16Array = new Uint16Array(rows * cols);
let backCells: Uint8Array = new Uint8Array(rows * cols);
let backAges: Uint16Array = new Uint16Array(rows * cols);

let running = false;
let idleRunning = false;
let speed = 500;
let timerId: ReturnType<typeof setTimeout> | null = null;
let idleTimerId: ReturnType<typeof setTimeout> | null = null;

function setupBuffers(newRows: number, newCols: number) {
  rows = newRows;
  cols = newCols;
  const size = rows * cols;
  frontCells = new Uint8Array(size);
  frontAges = new Uint16Array(size);
  backCells = new Uint8Array(size);
  backAges = new Uint16Array(size);
}

function postBoardUpdate() {
  self.postMessage({
    type: "tick",
    board: {
      cells: frontCells,
      ages: frontAges,
      rows,
      cols,
      generation,
      aliveCount,
    },
  });
}

function advanceStep() {
  const nextState = stepSimulation(
    {
      cells: frontCells,
      ages: frontAges,
      rows,
      cols,
      generation,
      aliveCount,
    },
    backCells,
    backAges,
  );

  generation = nextState.generation;
  aliveCount = nextState.aliveCount;

  const tempCells = frontCells;
  const tempAges = frontAges;
  frontCells = backCells;
  frontAges = backAges;
  backCells = tempCells;
  backAges = tempAges;
}

function runLoop() {
  if (!running) return;
  advanceStep();
  postBoardUpdate();
  timerId = setTimeout(runLoop, speed);
}

function runIdleLoop() {
  if (!idleRunning) return;
  const state: GameBoardState = {
    cells: frontCells,
    ages: frontAges,
    rows,
    cols,
    generation,
    aliveCount,
  };
  const next = injectRandomEdgePattern(state);
  frontCells.set(next.cells);
  frontAges.set(next.ages);
  aliveCount = next.aliveCount;
  postBoardUpdate();
  idleTimerId = setTimeout(runIdleLoop, Math.max(1000, speed * 2));
}

self.onmessage = (e: MessageEvent<WorkerInMessage>) => {
  const msg = e.data;
  switch (msg.type) {
    case "init":
      setupBuffers(msg.rows, msg.cols);
      speed = msg.speed;
      generation = 0;
      aliveCount = 0;
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
      advanceStep();
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

    case "clear": {
      running = false;
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      frontCells.fill(0);
      frontAges.fill(0);
      backCells.fill(0);
      backAges.fill(0);
      generation = 0;
      aliveCount = 0;
      postBoardUpdate();
      break;
    }

    case "randomize": {
      const state = createRandomBoard(rows, cols, msg.density, frontCells, frontAges);
      generation = 0;
      aliveCount = state.aliveCount;
      postBoardUpdate();
      break;
    }

    case "toggleCell": {
      const idx = msg.row * cols + msg.col;
      if (idx >= 0 && idx < frontCells.length) {
        const currentState = frontCells[idx] === 1;
        if (currentState !== msg.targetState) {
          frontCells[idx] = msg.targetState ? 1 : 0;
          frontAges[idx] = msg.targetState ? 1 : 0;
          aliveCount = Math.max(0, aliveCount + (msg.targetState ? 1 : -1));
          postBoardUpdate();
        }
      }
      break;
    }

    case "stamp": {
      const state: GameBoardState = {
        cells: frontCells,
        ages: frontAges,
        rows,
        cols,
        generation,
        aliveCount,
      };
      const stamped = stampPattern(state, msg.pattern, msg.row, msg.col, true, true);
      aliveCount = stamped.aliveCount;
      postBoardUpdate();
      break;
    }

    case "resize":
      if (rows !== msg.rows || cols !== msg.cols) {
        const oldState: GameBoardState = {
          cells: new Uint8Array(frontCells),
          ages: new Uint16Array(frontAges),
          rows,
          cols,
          generation,
          aliveCount,
        };
        setupBuffers(msg.rows, msg.cols);
        const resized = resizeBoard(oldState, msg.rows, msg.cols, frontCells, frontAges);
        generation = resized.generation;
        aliveCount = resized.aliveCount;
        postBoardUpdate();
      }
      break;
  }
};
