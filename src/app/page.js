"use client";
import { useState, useEffect, useCallback } from "react";
import styles from '@/app/page.module.css';

const numRows = 15;
const numCols = 30;

const Cell = ({ isAlive, onClick }) => (
  <div className={styles.cell} style={{ backgroundColor: isAlive ? 'grey' : 'white' }} onClick={onClick} />
);

const generateEmptyBoard = () => {
  let board = [];
  for (let i = 0; i < numRows; i++)
    board.push(Array(numCols).fill(false));
  return board;
}

const updateCell = (prevBoard, rowIndex, colIndex) => {
  const neighbours = countNeighbors(prevBoard, rowIndex, colIndex);
  return prevBoard[rowIndex][colIndex] ? (neighbours === 2 || neighbours === 3) : neighbours === 3;
};

const countNeighbors = (prevBoard, i, j) => {
  let count = 0;
  const neighborsOffsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

  neighborsOffsets.forEach(([offsetI, offsetJ]) => {
    const newRow = i + offsetI;
    const newCol = j + offsetJ;

    if (newRow >= 0 && newRow < numRows && newCol >= 0 && newCol < numCols && prevBoard[newRow][newCol])
      count++;
  });

  return count;
};

export default function Home() {
  const [board, setBoard] = useState(() => generateEmptyBoard());

  const toggleCell = (row, col) => {
    const newBoard = [...board];
    newBoard[row][col] = !newBoard[row][col];
    setBoard(newBoard);
  };

  const updateBoard = useCallback(() => {
    setBoard((prevBoard) =>
      prevBoard.map((row, i) =>
        row.map((cell, j) => updateCell(prevBoard, i, j))
      )
    );
  }, [setBoard]);

  useEffect(() => {
    const interval = setInterval(updateBoard, 5000);
    return () => clearInterval(interval);
  }, [updateBoard]);

  return (
    <main className={styles.mainContainer}>
      <h1 className={styles.title}> Conway's Game of Life </h1>

      <div className={styles.gameContainer} style={{ gridTemplateColumns: `repeat(${numCols}, var(--cell-size))` }}>
        {board.map((row, i) =>
          row.map((cell, j) =>
            <Cell key={`${i}-${j}`} isAlive={board[i][j]} onClick={() => toggleCell(i, j)} />
          )
        )}
      </div>
    </main>
  );
}
