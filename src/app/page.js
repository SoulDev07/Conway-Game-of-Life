"use client";
import { useState, useEffect, useCallback } from "react";
import Cell from "./components/cell";
import styles from './page.module.css';

// Constants for the board
const numRows = 15;
const numCols = 30;
const PATTERNS = [
  [[1, 0], [1, 1], [1, 2]],          // Blinker
  [[0, 1], [1, 1], [2, 1]],          // Glider
  [[0, 0], [0, 1], [1, 0], [1, 1]],  // Block
  [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]],  // L-Shape
  [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]],  // T-Shape
  [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],  // Line
  [[0, 0], [0, 1], [1, 1], [2, 1], [2, 0]],  // Glider Gun
];

const getIndex = (row, col) => (row + numRows) % numRows * numCols + (col + numCols) % numCols;

// Function to generate an empty board
const generateEmptyBoard = () => Array(numRows * numCols).fill(false);

// Function to update the state of a cell based on its neighbors
const updateCell = (prevBoard, rowIndex, colIndex) => {
  const index = getIndex(rowIndex, colIndex);
  const neighbours = countNeighbors(prevBoard, rowIndex, colIndex);
  return prevBoard[index] ? (neighbours === 2 || neighbours === 3) : neighbours === 3;
};

// Function to count the number of live neighbors for a given cell
const countNeighbors = (prevBoard, i, j) => {
  let count = 0;
  const neighborsOffsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

  neighborsOffsets.forEach(([offsetI, offsetJ]) => {
    const newRow = i + offsetI;
    const newCol = j + offsetJ;

    // Check if the adjacent cell is within the board boundaries and is alive
    if (prevBoard[getIndex((newRow + numRows) % numRows, (newCol + numCols) % numCols)])
      count++;
  });

  return count;
};

const getRandomPattern = () => PATTERNS[Math.floor(Math.random() * PATTERNS.length)];

const getPatternSize = (pattern) => {
  let maxRow = 0;
  let maxCol = 0;

  pattern.forEach(([offsetI, offsetJ]) => {
    maxRow = Math.max(maxRow, offsetI);
    maxCol = Math.max(maxCol, offsetJ);
  });

  return { rows: maxRow + 1, cols: maxCol + 1 };
};

const calculateStartingPosition = (pattern, edge) => {
  const { rows, cols } = getPatternSize(pattern);

  switch (edge) {
    case 0: // Top edge
      return [0, Math.floor(Math.random() * (numCols - cols + 1))];

    case 1: // Bottom edge
      return [numRows - rows, Math.floor(Math.random() * (numCols - cols + 1))];

    case 2: // Left edge
      return [Math.floor(Math.random() * (numRows - rows + 1)), 0];

    case 3: // Right edge
      return [Math.floor(Math.random() * (numRows - rows + 1)), numCols - cols];

    default:
      return [0, 0];
  }
};

const Board = ({ board, glowMode, onCellClick }) => (
  <div className={styles.gameContainer} style={{ gridTemplateColumns: `repeat(${numCols}, var(--cell-size))` }}>
    {board.map((cell, index) => (
      <Cell key={index} isAlive={cell} glowMode={glowMode} onClick={() => onCellClick(Math.floor(index / numCols), index % numCols)} />
    ))}
  </div>
);

export default function Home() {
  const [board, setBoard] = useState(() => generateEmptyBoard());
  const [running, setRunning] = useState(false);
  const [idleRunning, setIdleRunning] = useState(false);
  const [glowMode, setGlowMode] = useState(false);

  const toggleCell = useCallback((row, col) => {
    setBoard((prevBoard) => {
      const newBoard = [...prevBoard];
      const index = getIndex(row, col);
      newBoard[index] = !newBoard[index];
      return newBoard;
    });
  }, [setBoard]);

  const updateBoard = useCallback(() => {
    setBoard((prevBoard) =>
      prevBoard.map((cell, index) => updateCell(prevBoard, Math.floor(index / numCols), index % numCols))
    );
  }, [setBoard]);

  const resetBoard = useCallback(() => {
    setBoard(generateEmptyBoard());
    setRunning(false);
  }, [setBoard, setRunning]);

  const addRandomCells = () => {
    setBoard((prevBoard) => {
      const newBoard = [...prevBoard];
      const pattern = getRandomPattern();
      const randomEdge = Math.floor(Math.random() * 4);

      const [startRow, startCol] = calculateStartingPosition(pattern, randomEdge);

      pattern.forEach(([offsetI, offsetJ]) => {
        newBoard[getIndex(startRow + offsetI, startCol + offsetJ)] = true;
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
        <button className={styles.btn} onClick={() => { setIdleRunning(!idleRunning); setRunning(true) }}>
          {idleRunning ? 'Stop Idle' : 'Start Idle'}
        </button>
        <button className={styles.btn} onClick={() => setGlowMode(!glowMode)}>
          {glowMode ? 'Disable Glow' : 'Enable Glow'}
        </button>
      </div>

      <Board board={board} glowMode={glowMode} onCellClick={toggleCell} />
    </main>
  );
}
