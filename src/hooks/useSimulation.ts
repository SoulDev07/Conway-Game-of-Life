import { useCallback, useEffect, useRef, useState } from "react";
import {
  createEmptyGrid,
  createRandomGrid,
  getRuleStrategy,
  resizeGrid,
  simulationEventBus,
  stampPattern,
} from "@/lib";
import type {
  PresetPattern,
  RuleStrategy,
  SimulationGridState,
  WorkerInMessage,
  WorkerOutMessage,
} from "@/types";

export interface UseSimulationReturn {
  grid: SimulationGridState;
  running: boolean;
  idleRunning: boolean;
  speed: number;
  ruleId: string;
  currentRule: RuleStrategy;
  setRule: (newRuleId: string) => void;
  toggleRunning: () => void;
  toggleIdle: () => void;
  step: () => void;
  clear: () => void;
  randomize: () => void;
  setSpeed: (newSpeed: number) => void;
  toggleCell: (row: number, col: number, targetState: boolean) => void;
  stamp: (pattern: PresetPattern, row: number, col: number) => void;
  loadPattern: (pattern: PresetPattern) => void;
  resize: (newRows: number, newCols: number) => void;
  wrapEdges: boolean;
  toggleWrapEdges: () => void;
}

export const useSimulation = (initialRows: number, initialCols: number): UseSimulationReturn => {
  const [grid, setGrid] = useState<SimulationGridState>(() =>
    createEmptyGrid(initialRows, initialCols),
  );
  const [running, setRunning] = useState(false);
  const [idleRunning, setIdleRunning] = useState(false);
  const [wrapEdges, setWrapEdges] = useState(true);
  const [speed, setSpeed] = useState(500);
  const [ruleId, setRuleIdState] = useState("conway");
  const currentRule = getRuleStrategy(ruleId);

  const workerRef = useRef<Worker | null>(null);
  const pendingWorkerMessages = useRef<WorkerInMessage[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof Worker === "undefined") return;

    try {
      const worker = new Worker(new URL("../workers/simulation.worker.ts", import.meta.url), {
        type: "module",
      });

      worker.onmessage = (e: MessageEvent<WorkerOutMessage>) => {
        if (e.data.type === "tick") {
          setGrid(e.data.grid);
          simulationEventBus.emit("tick", {
            generation: e.data.grid.generation,
            aliveCount: e.data.grid.aliveCount,
          });
        }
      };

      workerRef.current = worker;

      const initMsg: WorkerInMessage = {
        type: "init",
        rows: initialRows,
        cols: initialCols,
        speed: 500,
      };
      worker.postMessage(initMsg);

      for (const msg of pendingWorkerMessages.current) {
        worker.postMessage(msg);
      }
      pendingWorkerMessages.current = [];

      return () => {
        worker.terminate();
        workerRef.current = null;
      };
    } catch {
      workerRef.current = null;
    }
  }, [initialRows, initialCols]);

  const postWorker = useCallback((msg: WorkerInMessage) => {
    if (workerRef.current) {
      workerRef.current.postMessage(msg);
    } else {
      pendingWorkerMessages.current.push(msg);
    }
  }, []);

  const resize = useCallback(
    (newRows: number, newCols: number) => {
      setGrid((prev) => {
        if (prev.rows === newRows && prev.cols === newCols) return prev;
        const next =
          prev.rows === 0 || prev.cols === 0
            ? createEmptyGrid(newRows, newCols)
            : resizeGrid(prev, newRows, newCols);
        postWorker({ type: "setGrid", grid: next });
        return next;
      });
    },
    [postWorker],
  );

  const toggleWrapEdges = useCallback(() => {
    setWrapEdges((prev) => {
      const next = !prev;
      postWorker({ type: "setWrapEdges", wrap: next });
      return next;
    });
  }, [postWorker]);

  const step = useCallback(() => {
    postWorker({ type: "step" });
  }, [postWorker]);

  const toggleRunning = useCallback(() => {
    setRunning((prev) => {
      const next = !prev;
      postWorker({ type: next ? "start" : "stop" });
      simulationEventBus.emit("runningChange", { running: next });
      return next;
    });
  }, [postWorker]);

  const toggleIdle = useCallback(() => {
    setIdleRunning((prev) => {
      const next = !prev;
      if (next) {
        setRunning(true);
        postWorker({ type: "start" });
      }
      postWorker({ type: "setIdle", idle: next });
      return next;
    });
  }, [postWorker]);

  const clear = useCallback(() => {
    setRunning(false);
    postWorker({ type: "stop" });
    setGrid((prev) => {
      const empty = createEmptyGrid(prev.rows, prev.cols);
      postWorker({ type: "setGrid", grid: empty });
      return empty;
    });
  }, [postWorker]);

  const randomize = useCallback(() => {
    setGrid((prev) => {
      const next = createRandomGrid(prev.rows, prev.cols, 0.2);
      postWorker({ type: "setGrid", grid: next });
      return next;
    });
  }, [postWorker]);

  const handleSetSpeed = useCallback(
    (newSpeed: number) => {
      setSpeed(newSpeed);
      postWorker({ type: "setSpeed", speed: newSpeed });
      simulationEventBus.emit("speedChange", { speed: newSpeed });
    },
    [postWorker],
  );

  const setRule = useCallback(
    (newRuleId: string) => {
      setRuleIdState(newRuleId);
      postWorker({ type: "setRule", ruleId: newRuleId });
      simulationEventBus.emit("ruleChange", { ruleId: newRuleId });
    },
    [postWorker],
  );

  const toggleCell = useCallback(
    (row: number, col: number, targetState: boolean) => {
      setGrid((prev) => {
        const idx = row * prev.cols + col;
        if (idx < 0 || idx >= prev.cells.length) return prev;

        const currentState = prev.cells[idx] === 1;
        if (currentState === targetState) return prev;

        const nextCells = new Uint8Array(prev.cells);
        const nextAges = new Uint16Array(prev.ages);

        nextCells[idx] = targetState ? 1 : 0;
        nextAges[idx] = targetState ? 1 : 0;
        const nextAliveCount = prev.aliveCount + (targetState ? 1 : -1);

        const next: SimulationGridState = {
          ...prev,
          cells: nextCells,
          ages: nextAges,
          aliveCount: Math.max(0, nextAliveCount),
        };
        postWorker({ type: "setGrid", grid: next });
        return next;
      });
    },
    [postWorker],
  );

  const stamp = useCallback(
    (pattern: PresetPattern, row: number, col: number) => {
      setGrid((prev) => {
        const next = stampPattern(prev, pattern, row, col);
        postWorker({ type: "setGrid", grid: next });
        return next;
      });
    },
    [postWorker],
  );

  const loadPattern = useCallback(
    (pattern: PresetPattern) => {
      setRunning(false);
      postWorker({ type: "stop" });
      setGrid((prev) => {
        const empty = createEmptyGrid(prev.rows, prev.cols);
        const centerR = Math.floor(prev.rows / 2);
        const centerC = Math.floor(prev.cols / 2);
        const next = stampPattern(empty, pattern, centerR, centerC, true, false);
        postWorker({ type: "setGrid", grid: next });
        return next;
      });
    },
    [postWorker],
  );

  return {
    grid,
    running,
    idleRunning,
    speed,
    ruleId,
    currentRule,
    setRule,
    toggleRunning,
    toggleIdle,
    step,
    clear,
    randomize,
    setSpeed: handleSetSpeed,
    toggleCell,
    stamp,
    loadPattern,
    resize,
    wrapEdges,
    toggleWrapEdges,
  };
};
