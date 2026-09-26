"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { computeCellMetrics, getPatternBounds } from "@/lib";
import type {
  CellCoordinate,
  GridSelection,
  PresetPattern,
  SimulationGridState,
  Theme,
} from "@/types";
import styles from "./LifeCanvas.module.css";

export interface LifeCanvasProps {
  grid: SimulationGridState;
  theme: Theme;
  bgColor: string;
  glowMode: boolean;
  onCellToggle: (row: number, col: number, targetState: boolean) => void;
  onStampPattern: (row: number, col: number) => void;
  onResize: (rows: number, cols: number) => void;
  isStamping: boolean;
  selectedPattern: PresetPattern | null;
  isSelecting: boolean;
  selection: GridSelection | null;
  onSelectionChange: (selection: GridSelection | null) => void;
}

export const LifeCanvas = ({
  grid,
  theme,
  bgColor,
  glowMode,
  onCellToggle,
  onStampPattern,
  onResize,
  isStamping,
  selectedPattern,
  isSelecting,
  selection,
  onSelectionChange,
}: LifeCanvasProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dimensionsRef = useRef({
    width: 0,
    height: 0,
    dpr: 1,
  });
  const isMouseDownRef = useRef(false);
  const isSelectingDragRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartCellRef = useRef<{ row: number; col: number } | null>(null);
  const currentPaintModeRef = useRef(true);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  const onResizeRef = useRef(onResize);
  onResizeRef.current = onResize;

  const getMetrics = useCallback(() => {
    const { width, height } = dimensionsRef.current;
    return computeCellMetrics(width, height, grid.cols, grid.rows);
  }, [grid.cols, grid.rows]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const { width, height } = entry.contentRect;
      const w = Math.floor(width);
      const h = Math.floor(height);
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
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
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

    const { cellSize, offsetX, offsetY } = getMetrics();

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const radius = Math.min(6, cellSize * 0.15);

    if (grid.aliveCount > 0) {
      const { cells, rows, cols } = grid;
      const cellsPath = new Path2D();

      for (let r = 0; r < rows; r++) {
        const rOffset = r * cols;
        for (let c = 0; c < cols; c++) {
          if (cells[rOffset + c] === 1) {
            const x = offsetX + c * cellSize;
            const y = offsetY + r * cellSize;
            if (cellsPath.roundRect) {
              cellsPath.roundRect(x, y, cellSize, cellSize, radius);
            } else {
              cellsPath.rect(x, y, cellSize, cellSize);
            }
          }
        }
      }

      if (glowMode) {
        ctx.save();
        ctx.shadowColor = theme.cellColor;
        ctx.shadowBlur = 30;
        ctx.fillStyle = theme.cellColor;
        ctx.fill(cellsPath);
        ctx.restore();
      }

      ctx.save();
      ctx.shadowBlur = 0;
      ctx.fillStyle = theme.cellColor;
      ctx.fill(cellsPath);

      ctx.strokeStyle = bgColor;
      ctx.lineWidth = 1.5;
      ctx.stroke(cellsPath);
      ctx.restore();
    }

    if (
      hoveredCell &&
      hoveredCell.row >= 0 &&
      hoveredCell.row < grid.rows &&
      hoveredCell.col >= 0 &&
      hoveredCell.col < grid.cols
    ) {
      if (isStamping && selectedPattern) {
        const { centerOffsetR, centerOffsetC } = getPatternBounds(selectedPattern);
        const startR = hoveredCell.row - centerOffsetR;
        const startC = hoveredCell.col - centerOffsetC;
        const stampPath = new Path2D();

        for (const [dr, dc] of selectedPattern.grid as CellCoordinate[]) {
          const r = (startR + dr + grid.rows * 100) % grid.rows;
          const c = (startC + dc + grid.cols * 100) % grid.cols;
          const x = offsetX + c * cellSize;
          const y = offsetY + r * cellSize;

          if (stampPath.roundRect) {
            stampPath.roundRect(x, y, cellSize, cellSize, radius);
          } else {
            stampPath.rect(x, y, cellSize, cellSize);
          }
        }

        ctx.save();
        ctx.fillStyle = theme.accentColor;
        ctx.globalAlpha = 0.45;
        ctx.fill(stampPath);
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

    if (selection) {
      const minR = Math.min(selection.startRow, selection.endRow);
      const maxR = Math.max(selection.startRow, selection.endRow);
      const minC = Math.min(selection.startCol, selection.endCol);
      const maxC = Math.max(selection.startCol, selection.endCol);

      const selX = offsetX + minC * cellSize;
      const selY = offsetY + minR * cellSize;
      const selW = (maxC - minC + 1) * cellSize;
      const selH = (maxR - minR + 1) * cellSize;

      ctx.save();
      ctx.fillStyle = theme.accentColor;
      ctx.globalAlpha = 0.2;
      ctx.fillRect(selX, selY, selW, selH);

      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = theme.accentColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(selX, selY, selW, selH);
      ctx.setLineDash([]);

      const corner = Math.min(6, Math.max(3, cellSize * 0.4));
      ctx.fillStyle = theme.accentColor;
      ctx.fillRect(selX - 1, selY - 1, corner, 2);
      ctx.fillRect(selX - 1, selY - 1, 2, corner);
      ctx.fillRect(selX + selW - corner + 1, selY - 1, corner, 2);
      ctx.fillRect(selX + selW - 1, selY - 1, 2, corner);
      ctx.fillRect(selX - 1, selY + selH - 1, corner, 2);
      ctx.fillRect(selX - 1, selY + selH - corner + 1, 2, corner);
      ctx.fillRect(selX + selW - corner + 1, selY + selH - 1, corner, 2);
      ctx.fillRect(selX + selW - 1, selY + selH - corner + 1, 2, corner);
      ctx.restore();
    }

    ctx.restore();
  }, [
    grid,
    theme,
    bgColor,
    glowMode,
    hoveredCell,
    isStamping,
    selectedPattern,
    selection,
    getMetrics,
  ]);

  const getCellFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const { cellSize, offsetX, offsetY } = getMetrics();

      const x = clientX - rect.left - offsetX;
      const y = clientY - rect.top - offsetY;

      if (x < 0 || y < 0) return null;
      const col = Math.floor(x / cellSize);
      const row = Math.floor(y / cellSize);

      if (row >= 0 && row < grid.rows && col >= 0 && col < grid.cols) {
        return { row, col };
      }
      return null;
    },
    [grid.rows, grid.cols, getMetrics],
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

    if (selection && !isSelecting && !e.shiftKey) {
      onSelectionChange(null);
    }

    if (isSelecting || e.shiftKey) {
      isSelectingDragRef.current = true;
      hasDraggedRef.current = false;
      dragStartCellRef.current = { row: cell.row, col: cell.col };
      return;
    }

    isMouseDownRef.current = true;
    const idx = cell.row * grid.cols + cell.col;
    const currentState = grid.cells[idx] === 1;
    const nextState = !currentState;
    currentPaintModeRef.current = nextState;

    onCellToggle(cell.row, cell.col, nextState);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cell = getCellFromEvent(e.clientX, e.clientY);
    setHoveredCell(cell);

    if (isSelectingDragRef.current && dragStartCellRef.current && cell) {
      if (cell.row !== dragStartCellRef.current.row || cell.col !== dragStartCellRef.current.col) {
        hasDraggedRef.current = true;
      }
      onSelectionChange({
        startRow: dragStartCellRef.current.row,
        startCol: dragStartCellRef.current.col,
        endRow: cell.row,
        endCol: cell.col,
      });
      return;
    }

    if (isMouseDownRef.current && cell && !isStamping) {
      onCellToggle(cell.row, cell.col, currentPaintModeRef.current);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    if (isSelectingDragRef.current) {
      if (!hasDraggedRef.current) {
        if (selection) {
          onSelectionChange(null);
        } else if (dragStartCellRef.current) {
          const idx = dragStartCellRef.current.row * grid.cols + dragStartCellRef.current.col;
          if (grid.cells[idx] === 1) {
            onSelectionChange({
              startRow: dragStartCellRef.current.row,
              startCol: dragStartCellRef.current.col,
              endRow: dragStartCellRef.current.row,
              endCol: dragStartCellRef.current.col,
            });
          }
        }
      }
    }

    isMouseDownRef.current = false;
    isSelectingDragRef.current = false;
    hasDraggedRef.current = false;
    dragStartCellRef.current = null;
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    isMouseDownRef.current = false;
    isSelectingDragRef.current = false;
    hasDraggedRef.current = false;
    dragStartCellRef.current = null;
    setHoveredCell(null);
  };

  const handlePointerLeave = () => {
    if (!isMouseDownRef.current && !isSelectingDragRef.current) {
      setHoveredCell(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className={styles.container}
      style={{ cursor: isStamping || isSelecting ? "crosshair" : "default" }}
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
