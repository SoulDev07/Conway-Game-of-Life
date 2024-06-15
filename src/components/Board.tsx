import React from "react";
import Cell from "./Cell";
import styles from './board.module.css';

interface BoardProps {
  board: boolean[];
  numRows: number;
  numCols: number;
  glowMode: boolean;
  onCellClick: (row: number, col: number) => void;
}

const Board: React.FC<BoardProps> = ({ board, numRows, numCols, glowMode, onCellClick }) => (
  <div className={styles.gameContainer}>
    {board.map((cell, index) => (
      <Cell
        key={index}
        isAlive={cell}
        glowMode={glowMode}
        onClick={() => onCellClick(Math.floor(index / numCols), index % numCols)}
      />
    ))}
  </div>
);

export default Board;
