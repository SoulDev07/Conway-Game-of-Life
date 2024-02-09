"use client";
import { useState, useEffect, useCallback } from "react";
import Cell from "./components/cell";
import styles from './page.module.css';

// Constants for the board
const PATTERNS = [
  [[1, 0], [1, 1], [1, 2]],          // Blinker
  [[0, 1], [1, 1], [2, 1]],          // Glider
  [[0, 0], [0, 1], [1, 0], [1, 1]],  // Block
  [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]],  // L-Shape
  [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]],  // T-Shape
  [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],  // Line
  [[0, 0], [0, 1], [1, 1], [2, 1], [2, 0]],  // Glider Gun
];
const NEIGHBOR_OFFSETS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];


const getIndex = (numRows, numCols, row, col) => (row + numRows) % numRows * numCols + (col + numCols) % numCols;

// Function to generate an empty board
const generateEmptyBoard = (numRows, numCols) => Array(numRows * numCols).fill(false);

// Function to update the state of a cell based on its neighbors
const updateCell = (prevBoard, numRows, numCols, rowIndex, colIndex) => {
  const index = getIndex(numRows, numCols, rowIndex, colIndex);
  const neighbours = countNeighbors(prevBoard, numRows, numCols, rowIndex, colIndex);
  const isAlive = prevBoard[index];

  return isAlive ? (neighbours === 2 || neighbours === 3) : neighbours === 3;
};

// Function to count the number of live neighbors for a given cell
const countNeighbors = (prevBoard, numRows, numCols, i, j) => {
  let count = 0;

  NEIGHBOR_OFFSETS.forEach(([offsetI, offsetJ]) => {
    const newRow = i + offsetI;
    const newCol = j + offsetJ;

    // Check if the adjacent cell is within the board boundaries and is alive
    if (prevBoard[getIndex(numRows, numCols, (newRow + numRows) % numRows, (newCol + numCols) % numCols)])
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

const calculateStartingPosition = (numRows, numCols, pattern, edge) => {
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

const Board = ({ board, numRows, numCols, glowMode, onCellClick }) => (
  <div id="board-container" className={styles.gameContainer}>
    {board.map((cell, index) => (
      <Cell key={index} isAlive={cell} glowMode={glowMode} onClick={() => onCellClick(Math.floor(index / numCols), index % numCols)} />
    ))}
  </div>
);

export default function Home() {
  const [board, setBoard] = useState(() => generateEmptyBoard(15, 30));
  const [numRows, setRows] = useState(15);
  const [numCols, setCols] = useState(30);
  const [running, setRunning] = useState(false);
  const [idleRunning, setIdleRunning] = useState(false);
  const [glowMode, setGlowMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("cyan");

  const toggleCell = useCallback((row, col) => {
    setBoard(prevBoard => {
      const newBoard = [...prevBoard];
      const index = getIndex(numRows, numCols, row, col);
      newBoard[index] = !newBoard[index];
      return newBoard;
    });
  }, [setBoard, numRows, numCols]);

  const toggleTheme = useCallback(() => {
    setCurrentTheme((prevTheme) => (prevTheme === "cyan" ? "green" : "cyan"));
  }, [setCurrentTheme]);

  const updateBoard = useCallback(() => {
    setBoard((prevBoard) =>
      prevBoard.map((cell, index) => updateCell(prevBoard, numRows, numCols, Math.floor(index / numCols), index % numCols))
    );
  }, [setBoard, numRows, numCols]);

  const resetBoard = useCallback(() => {
    setBoard(generateEmptyBoard(numRows, numCols));
    setRunning(false);
  }, [setBoard, setRunning, numCols, numRows]);

  const addRandomCells = useCallback(() => {
    setBoard((prevBoard) => {
      const newBoard = [...prevBoard];
      const pattern = getRandomPattern();
      const randomEdge = Math.floor(Math.random() * 4);

      const [startRow, startCol] = calculateStartingPosition(numRows, numCols, pattern, randomEdge);

      pattern.forEach(([offsetI, offsetJ]) => {
        newBoard[getIndex(numRows, numCols, startRow + offsetI, startCol + offsetJ)] = true;
      });

      return newBoard;
    });
  }, [setBoard, numRows, numCols]);

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
  }, [idleRunning, addRandomCells]);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      const rows = Math.floor((screenHeight * 0.80) / 40);
      const cols = Math.floor(screenWidth / 40);

      setRows(rows);
      setCols(cols);
      setBoard((prevBoard) => Array.from({ length: rows * cols }, (_, i) => prevBoard[i] || false));
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [])

  return (
    <main className={`${styles.mainContainer} ${currentTheme}-theme`}>
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
        <button className={styles.btn} onClick={toggleTheme}>
          {currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}
        </button>
      </div>

      <Board board={board} numRows={numRows} numCols={numCols} glowMode={glowMode} onCellClick={toggleCell} />
    </main>
  );
}
