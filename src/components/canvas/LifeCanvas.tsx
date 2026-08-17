"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getPatternBounds } from "@/lib";
import type { GameBoardState, PresetPattern, Theme } from "@/types";
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
  selectedPattern?: PresetPattern | null;
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
  selectedPattern,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dimensionsRef = useRef<{ width: number; height: number; dpr: number }>({
    width: 0,
    height: 0,
    dpr: 1,
  });
  const isMouseDownRef = useRef(false);
  const currentPaintModeRef = useRef(true);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  const onResizeRef = useRef(onResize);
  onResizeRef.current = onResize;

  const calculateCellMetrics = useCallback((w: number, h: number, bCols: number, bRows: number) => {
    if (w === 0 || h === 0 || bCols === 0 || bRows === 0) {
      return { cellSize: 24, offsetX: 0, offsetY: 0, width: w, height: h };
    }
    const isMobile = w < 640;
    const cellSize = isMobile
      ? Math.max(18, Math.min(28, Math.floor(w / 20)))
      : Math.max(16, Math.min(36, Math.floor(w * 0.025)));

    const offsetX = Math.floor((w - cellSize * bCols) / 2);
    const offsetY = Math.floor((h - cellSize * bRows) / 2);
    return { cellSize, offsetX, offsetY, width: w, height: h };
  }, []);

  const getCellMetrics = useCallback(() => {
    const { width, height } = dimensionsRef.current;
    return calculateCellMetrics(width, height, board.cols, board.rows);
  }, [board.cols, board.rows, calculateCellMetrics]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      if (w === 0 || h === 0) return;

      const dpr = window.devicePixelRatio || 1;
      dimensionsRef.current = { width: w, height: h, dpr };

      if (canvasRef.current) {
        canvasRef.current.width = Math.round(w * dpr);
        canvasRef.current.height = Math.round(h * dpr);
      }

      const isMobile = w < 640;
      const cellSize = isMobile
        ? Math.max(18, Math.min(28, Math.floor(w / 20)))
        : Math.max(16, Math.min(36, Math.floor(w * 0.025)));

      const cols = Math.max(8, Math.floor(w / cellSize));
      const rows = Math.max(6, Math.floor(h / cellSize));

      onResizeRef.current(rows, cols);
    };

    const observer = new ResizeObserver(() => {
      updateDimensions();
    });

    observer.observe(container);
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("orientationchange", updateDimensions);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("orientationchange", updateDimensions);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height, dpr } = dimensionsRef.current;
    if (width === 0 || height === 0) return;

    ctx.save();
    ctx.scale(dpr, dpr);

    const { cellSize, offsetX, offsetY } = getCellMetrics();

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const radius = Math.min(6, cellSize * 0.15);

    // Render live cells
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
      if (isStamping && selectedPattern) {
        const { centerOffsetR, centerOffsetC } = getPatternBounds(selectedPattern);
        const startR = hoveredCell.row - centerOffsetR;
        const startC = hoveredCell.col - centerOffsetC;

        ctx.save();
        ctx.fillStyle = theme.accentColor;
        ctx.globalAlpha = 0.45;

        for (const [dr, dc] of selectedPattern.grid) {
          const r = (startR + dr + board.rows * 100) % board.rows;
          const c = (startC + dc + board.cols * 100) % board.cols;
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
        ctx.restore();
      } else {
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
    }

    ctx.restore();
  }, [board, theme, bgColor, glowMode, hoveredCell, isStamping, selectedPattern, getCellMetrics]);

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
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

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

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    isMouseDownRef.current = false;
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    isMouseDownRef.current = false;
    setHoveredCell(null);
  };

  const handlePointerLeave = () => {
    if (!isMouseDownRef.current) {
      setHoveredCell(null);
    }
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
        aria-label="Interactive Game of Life grid. Click or drag to toggle cells, or stamp selected pattern."
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerLeave}
      />
    </div>
  );
};

export default LifeCanvas;
