import React from "react";
import styles from "./cell.module.css";

const Cell = React.memo(({ isAlive, glowMode, onClick }) => (
  <div className={`${styles.cell} ${isAlive && glowMode ? styles.glow : ''}`} style={{ backgroundColor: isAlive && 'var(--cell-color)' }} onClick={onClick} />
));

Cell.displayName = 'Cell';

export default Cell;
