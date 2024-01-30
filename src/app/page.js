"use client";
import { useState, useEffect } from "react";
import styles from '@/app/page.module.css'

const numRows = 15;
const numCols = 30;

const Cell = ({ isAlive, onClick }) => (
  <div className={styles.cell} style={{ backgroundColor: isAlive ? 'grey' : 'white' }} onClick={onClick} />
);


function generateBoard() {
  let board = [];
  for (let i = 0; i < numRows; i++)
    board.push(Array(numCols).fill(false));
  return board;
}

export default function Home() {
  const [board, setBoard] = useState(() => generateBoard());

  useEffect(() => {
    const interval = setInterval(updateBoard, 500);
    return () => clearInterval(interval);
  }, [updateBoard]);

  function toggleCell(row, col) {
    const newBoard = [...board];
    newBoard[row][col] = !newBoard[row][col];
    setBoard(newBoard);
  };

  function updateBoard() {
    const newBoard = board.map((row, i) => row.map((cell, j) => updateCell(i, j)));
    setBoard(newBoard);
  }

  function updateCell(i, j) {
    const neighbours = countNeighbors(i, j);

    if (board[i][j])
      return (neighbours <= 1 || neighbours >= 4) ? false : true;
    else
      if (neighbours === 3)
        return true;
  }

  function countNeighbors(i, j) {
    let count = 0;
    const neighborsOffsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

    neighborsOffsets.forEach(([offsetI, offsetJ]) => {
      const newRow = i + offsetI;
      const newCol = j + offsetJ;

      if (newRow >= 0 && newRow < numRows && newCol >= 0 && newCol < numCols && board[newRow][newCol])
        count++;
    });

    return count;
  }

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
