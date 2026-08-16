import { useCallback, useEffect, useState } from "react";
import {
  createEmptyBoard,
  createRandomBoard,
  injectRandomEdgePattern,
  resizeBoard,
  stampPattern,
  stepSimulation,
} from "@/lib";
import type { GameBoardState, PresetPattern } from "@/types";

export function useGameSimulation(initialRows: number, initialCols: number) {
  const [board, setBoard] = useState<GameBoardState>(() =>
    createEmptyBoard(initialRows, initialCols),
  );
  const [running, setRunning] = useState(false);
  const [idleRunning, setIdleRunning] = useState(false);
  const [speed, setSpeed] = useState(500);

  const resize = useCallback((newRows: number, newCols: number) => {
    setBoard((prev) => {
      if (prev.rows === newRows && prev.cols === newCols) return prev;
      if (prev.rows === 0 || prev.cols === 0) {
        return createEmptyBoard(newRows, newCols);
      }
      return resizeBoard(prev, newRows, newCols);
    });
  }, []);

  const step = useCallback(() => {
    setBoard((prev) => stepSimulation(prev));
  }, []);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(step, speed);
    return () => clearInterval(interval);
  }, [running, speed, step]);

  useEffect(() => {
    if (!idleRunning) return;
    const interval = setInterval(
      () => {
        setBoard((prev) => injectRandomEdgePattern(prev));
      },
      Math.max(1000, speed * 2),
    );
    return () => clearInterval(interval);
  }, [idleRunning, speed]);

  const toggleRunning = useCallback(() => {
    setRunning((prev) => !prev);
  }, []);

  const toggleIdle = useCallback(() => {
    setIdleRunning((prev) => {
      const next = !prev;
      if (next) setRunning(true);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setRunning(false);
    setBoard((prev) => createEmptyBoard(prev.rows, prev.cols));
  }, []);

  const randomize = useCallback(() => {
    setBoard((prev) => createRandomBoard(prev.rows, prev.cols, 0.2));
  }, []);

  const toggleCell = useCallback((row: number, col: number, targetState: boolean) => {
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
  }, []);

  const stamp = useCallback((pattern: PresetPattern, row: number, col: number) => {
    setBoard((prev) => stampPattern(prev, pattern, row, col));
  }, []);

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
    setSpeed,
    toggleCell,
    stamp,
    resize,
  };
}
