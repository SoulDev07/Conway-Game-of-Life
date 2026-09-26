import {
  CONWAY_RULE,
  createRandomGrid,
  getRuleStrategy,
  injectRandomEdgePattern,
  resizeGrid,
  stampPattern,
  stepSimulation,
} from "@/lib";
import type { SimulationGridState, WorkerInMessage } from "@/types";

let currentRule = CONWAY_RULE;
let rows = 16;
let cols = 32;
let generation = 0;
let aliveCount = 0;

let frontCells = new Uint8Array(rows * cols);
let frontAges = new Uint16Array(rows * cols);
let backCells = new Uint8Array(rows * cols);
let backAges = new Uint16Array(rows * cols);

let running = false;
let idleRunning = false;
let wrapEdges = true;
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

function postGridUpdate() {
  self.postMessage({
    type: "tick",
    grid: {
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
    currentRule,
    wrapEdges,
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
  postGridUpdate();
  timerId = setTimeout(runLoop, speed);
}

function runIdleLoop() {
  if (!idleRunning) return;
  const state: SimulationGridState = {
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
  postGridUpdate();
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
      postGridUpdate();
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
      postGridUpdate();
      break;
    }

    case "randomize": {
      const state = createRandomGrid(rows, cols, msg.density, frontCells, frontAges);
      generation = 0;
      aliveCount = state.aliveCount;
      postGridUpdate();
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
          postGridUpdate();
        }
      }
      break;
    }

    case "stamp": {
      const state: SimulationGridState = {
        cells: frontCells,
        ages: frontAges,
        rows,
        cols,
        generation,
        aliveCount,
      };
      const stamped = stampPattern(state, msg.pattern, msg.row, msg.col, true, true);
      aliveCount = stamped.aliveCount;
      postGridUpdate();
      break;
    }

    case "loadPattern": {
      frontCells.fill(0);
      frontAges.fill(0);
      backCells.fill(0);
      backAges.fill(0);
      generation = 0;
      aliveCount = 0;
      const centerR = Math.floor(rows / 2);
      const centerC = Math.floor(cols / 2);
      const state: SimulationGridState = {
        cells: frontCells,
        ages: frontAges,
        rows,
        cols,
        generation,
        aliveCount,
      };
      const stamped = stampPattern(state, msg.pattern, centerR, centerC, true, true);
      aliveCount = stamped.aliveCount;
      postGridUpdate();
      break;
    }

    case "setGrid": {
      if (rows !== msg.grid.rows || cols !== msg.grid.cols) {
        setupBuffers(msg.grid.rows, msg.grid.cols);
      }
      frontCells.set(msg.grid.cells);
      frontAges.set(msg.grid.ages);
      generation = msg.grid.generation;
      aliveCount = msg.grid.aliveCount;
      break;
    }

    case "resize":
      if (rows !== msg.rows || cols !== msg.cols) {
        const oldState: SimulationGridState = {
          cells: new Uint8Array(frontCells),
          ages: new Uint16Array(frontAges),
          rows,
          cols,
          generation,
          aliveCount,
        };
        setupBuffers(msg.rows, msg.cols);
        const resized = resizeGrid(oldState, msg.rows, msg.cols, frontCells, frontAges);
        generation = resized.generation;
        aliveCount = resized.aliveCount;
      }
      break;

    case "setRule":
      currentRule = getRuleStrategy(msg.ruleId);
      break;

    case "setWrapEdges":
      wrapEdges = msg.wrap;
      break;
  }
};
