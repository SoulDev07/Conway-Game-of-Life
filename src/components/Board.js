import React from "react";
import Cell from "./Cell";
import styles from './board.module.css';

const Board = ({ board, numRows, numCols, glowMode, onCellClick }) => (
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
