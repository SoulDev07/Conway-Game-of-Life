import { useCallback, useEffect, useRef, useState } from "react";
import {
  createEmptyBoard,
  createRandomBoard,
  injectRandomEdgePattern,
  resizeBoard,
  stampPattern,
  stepSimulation,
} from "@/lib";
import type { GameBoardState, PresetPattern } from "@/types";
import type { WorkerInMessage, WorkerOutMessage } from "@/workers/simulation.worker";

export function useGameSimulation(initialRows: number, initialCols: number) {
  const [board, setBoard] = useState<GameBoardState>(() =>
    createEmptyBoard(initialRows, initialCols),
  );
  const [running, setRunning] = useState(false);
  const [idleRunning, setIdleRunning] = useState(false);
  const [speed, setSpeed] = useState(500);

  const workerRef = useRef<Worker | null>(null);
  const isWorkerReady = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof Worker === "undefined") return;

    try {
      const worker = new Worker(new URL("../workers/simulation.worker.ts", import.meta.url), {
        type: "module",
      });

      worker.onmessage = (e: MessageEvent<WorkerOutMessage>) => {
        if (e.data.type === "tick") {
          setBoard(e.data.board);
        }
      };

      workerRef.current = worker;
      isWorkerReady.current = true;

      const initMsg: WorkerInMessage = {
        type: "init",
        rows: initialRows,
        cols: initialCols,
        speed: 500,
      };
      worker.postMessage(initMsg);

      return () => {
        worker.terminate();
        workerRef.current = null;
        isWorkerReady.current = false;
      };
    } catch {
      workerRef.current = null;
      isWorkerReady.current = false;
    }
  }, [initialRows, initialCols]);

  useEffect(() => {
    if (workerRef.current || !running) return;

    let animId: number;
    let lastTime = performance.now();
    let accumulator = 0;

    const loop = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;
      accumulator += Math.min(delta, 1000);

      if (accumulator >= speed) {
        setBoard((prev) => {
          let nextBoard = prev;
          while (accumulator >= speed) {
            nextBoard = stepSimulation(nextBoard);
            accumulator -= speed;
          }
          return nextBoard;
        });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [running, speed]);

  useEffect(() => {
    if (workerRef.current || !idleRunning) return;

    let animId: number;
    let lastTime = performance.now();
    let accumulator = 0;
    const idleInterval = Math.max(1000, speed * 2);

    const loop = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;
      accumulator += Math.min(delta, 2000);

      if (accumulator >= idleInterval) {
        setBoard((prev) => injectRandomEdgePattern(prev));
        accumulator -= idleInterval;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [idleRunning, speed]);

  const postWorker = useCallback((msg: WorkerInMessage) => {
    if (workerRef.current) {
      workerRef.current.postMessage(msg);
    }
  }, []);

  const resize = useCallback(
    (newRows: number, newCols: number) => {
      setBoard((prev) => {
        if (prev.rows === newRows && prev.cols === newCols) return prev;
        const next =
          prev.rows === 0 || prev.cols === 0
            ? createEmptyBoard(newRows, newCols)
            : resizeBoard(prev, newRows, newCols);
        return next;
      });
      postWorker({ type: "resize", rows: newRows, cols: newCols });
    },
    [postWorker],
  );

  const step = useCallback(() => {
    if (workerRef.current) {
      postWorker({ type: "step" });
    } else {
      setBoard((prev) => stepSimulation(prev));
    }
  }, [postWorker]);

  const toggleRunning = useCallback(() => {
    setRunning((prev) => {
      const next = !prev;
      postWorker({ type: next ? "start" : "stop" });
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
    postWorker({ type: "clear" });
    setBoard((prev) => createEmptyBoard(prev.rows, prev.cols));
  }, [postWorker]);

  const randomize = useCallback(() => {
    postWorker({ type: "randomize", density: 0.2 });
    if (!workerRef.current) {
      setBoard((prev) => createRandomBoard(prev.rows, prev.cols, 0.2));
    }
  }, [postWorker]);

  const handleSetSpeed = useCallback(
    (newSpeed: number) => {
      setSpeed(newSpeed);
      postWorker({ type: "setSpeed", speed: newSpeed });
    },
    [postWorker],
  );

  const toggleCell = useCallback(
    (row: number, col: number, targetState: boolean) => {
      setBoard((prev) => {
        const idx = row * prev.cols + col;
        if (idx < 0 || idx >= prev.cells.length) return prev;

        const currentState = prev.cells[idx] === 1;
        if (currentState === targetState) return prev;

        const nextCells = new Uint8Array(prev.cells);
        const nextAges = new Uint16Array(prev.ages);

        nextCells[idx] = targetState ? 1 : 0;
        nextAges[idx] = targetState ? 1 : 0;
        const nextAliveCount = prev.aliveCount + (targetState ? 1 : -1);

        return {
          ...prev,
          cells: nextCells,
          ages: nextAges,
          aliveCount: Math.max(0, nextAliveCount),
        };
      });
      postWorker({ type: "toggleCell", row, col, targetState });
    },
    [postWorker],
  );

  const stamp = useCallback(
    (pattern: PresetPattern, row: number, col: number) => {
      setBoard((prev) => stampPattern(prev, pattern, row, col));
      postWorker({ type: "stamp", pattern, row, col });
    },
    [postWorker],
  );

  return {
    board,
    running,
    idleRunning,
    speed,
    toggleRunning,
    toggleIdle,
    step,
    clear,
    randomize,
    setSpeed: handleSetSpeed,
    toggleCell,
    stamp,
    resize,
  };
}
