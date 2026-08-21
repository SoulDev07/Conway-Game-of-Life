export interface CellMetrics {
  cellSize: number;
  offsetX: number;
  offsetY: number;
}

export function computeCellMetrics(
  width: number,
  height: number,
  cols: number,
  rows: number,
): CellMetrics {
  if (width === 0 || height === 0 || cols === 0 || rows === 0) {
    return { cellSize: 24, offsetX: 0, offsetY: 0 };
  }
  const isMobile = width < 640;
  const cellSize = isMobile
    ? Math.max(18, Math.min(28, Math.floor(width / 20)))
    : Math.max(16, Math.min(36, Math.floor(width * 0.025)));

  const offsetX = Math.floor((width - cellSize * cols) / 2);
  const offsetY = Math.floor((height - cellSize * rows) / 2);
  return { cellSize, offsetX, offsetY };
}
