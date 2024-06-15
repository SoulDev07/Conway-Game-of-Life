import React from "react";
import styles from "./cell.module.css";

interface CellProps {
  isAlive: boolean;
  glowMode: boolean;
  onClick: () => void;
}

const Cell: React.FC<CellProps> = React.memo(({ isAlive, glowMode, onClick }) => (
  <div
    className={`${styles.cell} ${isAlive && glowMode ? styles.glow : ''}`}
    style={{ backgroundColor: isAlive ? 'var(--cell-color)' : 'transparent' }}
    onClick={onClick}
  />
));

Cell.displayName = 'Cell';

export default Cell;
