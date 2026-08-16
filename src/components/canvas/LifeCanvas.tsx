"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GameBoardState, Theme } from "@/types";
import styles from "./LifeCanvas.module.css";

interface LifeCanvasProps {
  board: GameBoardState;
  theme: Theme;
  bgColor: string;
  glowMode: boolean;
  onCellToggle: (row: number, col: number, targetState: boolean) => void;
  onStampPattern: (row: number, col: number) => void;
  onResize: (rows: number, cols: number) => void;
  isStamping: boolean;
}

export const LifeCanvas: React.FC<LifeCanvasProps> = ({
  board,
  theme,
  bgColor,
  glowMode,
  onCellToggle,
  onStampPattern,
  onResize,
  isStamping,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isMouseDownRef = useRef(false);
  const currentPaintModeRef = useRef(true);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  const onResizeRef = useRef(onResize);
  onResizeRef.current = onResize;

  const getCellMetrics = useCallback(() => {
    if (!canvasRef.current || board.cols === 0 || board.rows === 0) {
      return { cellSize: 32, offsetX: 0, offsetY: 0, width: 0, height: 0 };
    }
    const rect = canvasRef.current.getBoundingClientRect();
    const cellSize = Math.max(16, Math.floor(window.innerWidth * 0.025));
    const offsetX = Math.floor((rect.width - cellSize * board.cols) / 2);
    const offsetY = Math.floor((rect.height - cellSize * board.rows) / 2);
    return { cellSize, offsetX, offsetY, width: rect.width, height: rect.height };
  }, [board.cols, board.rows]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w === 0 || h === 0) continue;

        const cellSize = Math.max(16, Math.floor(window.innerWidth * 0.025));
        const cols = Math.max(8, Math.floor(w / cellSize));
        const rows = Math.max(6, Math.floor(h / cellSize));

        onResizeRef.current(rows, cols);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.save();
    ctx.scale(dpr, dpr);

    const { cellSize, offsetX, offsetY, width, height } = getCellMetrics();

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const radius = Math.min(6, cellSize * 0.15);

    if (board.aliveCount > 0) {
      const { cells, rows, cols } = board;

      if (glowMode) {
        ctx.save();
        ctx.shadowColor = theme.cellColor;
        ctx.shadowBlur = 30;
        ctx.fillStyle = theme.cellColor;

        for (let r = 0; r < rows; r++) {
          const rOffset = r * cols;
          for (let c = 0; c < cols; c++) {
            if (cells[rOffset + c] === 1) {
              const x = offsetX + c * cellSize;
              const y = offsetY + r * cellSize;
              ctx.beginPath();
              if (ctx.roundRect) {
                ctx.roundRect(x, y, cellSize, cellSize, radius);
              } else {
                ctx.rect(x, y, cellSize, cellSize);
              }
              ctx.fill();
            }
          }
        }
        ctx.restore();
      }

      ctx.save();
      ctx.shadowBlur = 0;
      ctx.fillStyle = theme.cellColor;

      for (let r = 0; r < rows; r++) {
        const rOffset = r * cols;
        for (let c = 0; c < cols; c++) {
          if (cells[rOffset + c] === 1) {
            const x = offsetX + c * cellSize;
            const y = offsetY + r * cellSize;

            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(x, y, cellSize, cellSize, radius);
            } else {
              ctx.rect(x, y, cellSize, cellSize);
            }
            ctx.fill();

            ctx.strokeStyle = bgColor;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }

    if (
      hoveredCell &&
      hoveredCell.row >= 0 &&
      hoveredCell.row < board.rows &&
      hoveredCell.col >= 0 &&
      hoveredCell.col < board.cols
    ) {
      const x = offsetX + hoveredCell.col * cellSize;
      const y = offsetY + hoveredCell.row * cellSize;
      ctx.strokeStyle = theme.accentColor;
      ctx.lineWidth = 1.5;
      ctx.fillStyle = theme.trailColor;
      ctx.globalAlpha = 0.2;
      ctx.fillRect(x, y, cellSize, cellSize);
      ctx.globalAlpha = 0.8;
      ctx.strokeRect(x, y, cellSize, cellSize);
    }

    ctx.restore();
  }, [board, theme, bgColor, glowMode, hoveredCell, getCellMetrics]);

  const getCellFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const { cellSize, offsetX, offsetY } = getCellMetrics();

      const x = clientX - rect.left - offsetX;
      const y = clientY - rect.top - offsetY;

      if (x < 0 || y < 0) return null;
      const col = Math.floor(x / cellSize);
      const row = Math.floor(y / cellSize);

      if (row >= 0 && row < board.rows && col >= 0 && col < board.cols) {
        return { row, col };
      }
      return null;
    },
    [board.rows, board.cols, getCellMetrics],
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const cell = getCellFromEvent(e.clientX, e.clientY);
    if (!cell) return;

    if (isStamping) {
      onStampPattern(cell.row, cell.col);
      return;
    }

    isMouseDownRef.current = true;
    const idx = cell.row * board.cols + cell.col;
    const currentState = board.cells[idx] === 1;
    const nextState = !currentState;
    currentPaintModeRef.current = nextState;

    onCellToggle(cell.row, cell.col, nextState);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cell = getCellFromEvent(e.clientX, e.clientY);
    setHoveredCell(cell);

    if (isMouseDownRef.current && cell && !isStamping) {
      onCellToggle(cell.row, cell.col, currentPaintModeRef.current);
    }
  };

  const handlePointerUp = () => {
    isMouseDownRef.current = false;
  };

  const handlePointerLeave = () => {
    isMouseDownRef.current = false;
    setHoveredCell(null);
  };

  return (
    <div
      ref={containerRef}
      className={styles.container}
      style={{ cursor: isStamping ? "crosshair" : "default" }}
    >
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      />
    </div>
  );
};

export default LifeCanvas;
