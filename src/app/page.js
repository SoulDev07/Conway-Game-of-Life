"use client";
import { useState, useEffect, useCallback } from "react";
import Cell from "./components/cell"
import styles from './page.module.css';

// Constants for the size of the board
const numRows = 15;
const numCols = 30;

// Function to generate an empty board
const generateEmptyBoard = () => {
  let board = [];
  for (let i = 0; i < numRows; i++)
    board.push(Array(numCols).fill(false));
  return board;
}

// Function to update the state of a cell based on its neighbors
const updateCell = (prevBoard, rowIndex, colIndex) => {
  const neighbours = countNeighbors(prevBoard, rowIndex, colIndex);
  return prevBoard[rowIndex][colIndex] ? (neighbours === 2 || neighbours === 3) : neighbours === 3;
};

// Function to count the number of live neighbors for a given cell
const countNeighbors = (prevBoard, i, j) => {
  let count = 0;
  const neighborsOffsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

  neighborsOffsets.forEach(([offsetI, offsetJ]) => {
    const newRow = i + offsetI;
    const newCol = j + offsetJ;

    // Check if the adjacent cell is within the board boundaries and is alive
    if (newRow >= 0 && newRow < numRows && newCol >= 0 && newCol < numCols && prevBoard[newRow][newCol])
      count++;
  });

  return count;
};

const Board = ({ board, onCellClick }) => (
  <div className={styles.gameContainer} style={{ gridTemplateColumns: `repeat(${numCols}, var(--cell-size))` }}>
    {board.map((row, i) =>
      row.map((cell, j) => (
        <Cell key={`${i}-${j}`} isAlive={cell} onClick={() => onCellClick(i, j)} />
      ))
    )}
  </div>
);

export default function Home() {
  const [board, setBoard] = useState(() => generateEmptyBoard());
  const [running, setRunning] = useState(false);
  const [idleRunning, setIdleRunning] = useState(false);

  const toggleCell = useCallback((row, col) => {
    setBoard((prevBoard) => {
      const newBoard = [...prevBoard];
      newBoard[row][col] = !newBoard[row][col];
      return newBoard;
    });
  }, [setBoard]);

  const updateBoard = useCallback(() => {
    setBoard((prevBoard) =>
      prevBoard.map((row, i) =>
        row.map((cell, j) => updateCell(prevBoard, i, j))
      )
    );
  }, [setBoard]);

  const resetBoard = useCallback(() => {
    setBoard(generateEmptyBoard());
    setRunning(false);
  }, [setBoard, setRunning]);

  const addRandomCells = () => {
    setBoard((prevBoard) => {
      const newBoard = [...prevBoard];
      const patterns = [
        [[1, 0], [1, 1], [1, 2]], // Blinker
        [[0, 1], [1, 1], [2, 1]], // Glider
        [[0, 0], [0, 1], [1, 0], [1, 1]], // Block
      ];

      const getPatternSize = (pattern) => {
        let maxRow = 0;
        let maxCol = 0;

        pattern.forEach(([offsetI, offsetJ]) => {
          maxRow = Math.max(maxRow, offsetI);
          maxCol = Math.max(maxCol, offsetJ);
        });

        return { rows: maxRow + 1, cols: maxCol + 1 };
      };

      const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
      const randomEdge = Math.floor(Math.random() * 4);

      // Calculate the valid starting position on the chosen edge to place the pattern
      let startRow, startCol;

      switch (randomEdge) {
        case 0: // Top edge
          startRow = getPatternSize(randomPattern).rows;
          startCol = Math.floor(Math.random() * (numCols - randomPattern[0].length + 1));
          break;
        case 1: // Bottom edge
          startRow = numRows - getPatternSize(randomPattern).rows;
          startCol = Math.floor(Math.random() * (numCols - randomPattern[0].length + 1));
          break;
        case 2: // Left edge
          startRow = Math.floor(Math.random() * (numRows - randomPattern.length + 1));
          startCol = getPatternSize(randomPattern).cols;
          break;
        case 3: // Right edge
          startRow = Math.floor(Math.random() * (numRows - randomPattern.length + 1));
          startCol = numCols - getPatternSize(randomPattern).cols;
          break;
        default:
          break;
      }

      // Place the pattern on the board
      randomPattern.forEach(([offsetI, offsetJ]) => {
        newBoard[startRow + offsetI][startCol + offsetJ] = true;
      });

      return newBoard;
    });
  };

  useEffect(() => {
    let interval;
    if (running)
      interval = setInterval(updateBoard, 500);
    return () => clearInterval(interval);
  }, [updateBoard, running]);

  useEffect(() => {
    let idleInterval;
    if (idleRunning)
      idleInterval = setInterval(() => addRandomCells(), 1000);
    return () => clearInterval(idleInterval);
  }, [idleRunning]);


  return (
    <main className={styles.mainContainer}>
      <h1 className={styles.title}> Conway’s Game of Life </h1>

      <div className={styles.btnList}>
        <button className={styles.btn} onClick={() => setRunning(!running)}>
          {running ? 'Stop' : 'Start'}
        </button>
        <button className={styles.btn} onClick={resetBoard}> Reset </button>
        <button className={styles.btn} onClick={() => setIdleRunning(!idleRunning)}>
          {idleRunning ? 'Stop Idle' : 'Start Idle'}
        </button>
      </div>

      <Board board={board} onCellClick={toggleCell} />
    </main>
  );
}
