"use client";
import { useState, useEffect, useCallback } from "react";
import localFont from 'next/font/local';
import Board from "@/components/Board";
import Controls from "@/components/Controls";
import { generateEmptyBoard, updateCell, getRandomPattern, calculateStartingPosition } from "@/lib/game";
import styles from './page.module.css';

const Tiny5 = localFont({ src: './Tiny5-Regular.ttf' })

export default function Home() {
  const [board, setBoard] = useState(() => generateEmptyBoard(15, 30));
  const [numRows, setRows] = useState(15);
  const [numCols, setCols] = useState(30);
  const [running, setRunning] = useState(false);
  const [idleRunning, setIdleRunning] = useState(false);
  const [glowMode, setGlowMode] = useState(false);
  const [intervalSpeed, setIntervalSpeed] = useState(500);
  const [currentTheme, setCurrentTheme] = useState<"cyan" | "green">("cyan");

  // Function to toggle the state of a cell
  const toggleCell = useCallback((row: number, col: number) => {
    setBoard(prevBoard => {
      const newBoard = [...prevBoard];
      const index = (row * numCols + col);
      newBoard[index] = !newBoard[index];
      return newBoard;
    });
  }, [numCols]);

  // Function to update the board based on the rules of the game
  const updateBoard = useCallback(() => {
    setBoard(prevBoard => prevBoard.map((cell, index) => {
      const row = Math.floor(index / numCols);
      const col = index % numCols;
      return updateCell(prevBoard, numRows, numCols, row, col);
    }));
  }, [numRows, numCols]);

  //Function to reset the board
  const resetBoard = useCallback(() => {
    setBoard(generateEmptyBoard(numRows, numCols));
    setRunning(false);
  }, [numRows, numCols]);

  // Function to add a random pattern to the board
  const addRandomPattern = useCallback(() => {
    setBoard(prevBoard => {
      const newBoard = [...prevBoard];
      const pattern = getRandomPattern();
      const randomEdge = Math.floor(Math.random() * 4);
      const [startRow, startCol] = calculateStartingPosition(numRows, numCols, pattern, randomEdge);
      pattern.forEach(([offsetI, offsetJ]) => {
        newBoard[(startRow + offsetI) * numCols + (startCol + offsetJ)] = true;
      });
      return newBoard;
    });
  }, [numRows, numCols]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (running)
      interval = setInterval(updateBoard, intervalSpeed);
    return () => clearInterval(interval);
  }, [updateBoard, running, intervalSpeed]);

  useEffect(() => {
    let idleInterval: NodeJS.Timeout;
    if (idleRunning)
      idleInterval = setInterval(addRandomPattern, 2 * intervalSpeed);
    return () => clearInterval(idleInterval);
  }, [idleRunning, addRandomPattern, intervalSpeed]);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Update Cell Size
      const rootComputedStyle = getComputedStyle(document.documentElement);
      const cellDimensions = rootComputedStyle.getPropertyValue('--cell-size').trim();
      const cellValues = cellDimensions.match(/\d+\.?\d*/g);
      const cellSize = cellValues ? Math.max(parseFloat(cellValues[0]), parseFloat(cellValues[1]) * screenWidth / 100) : 10;

      const rows = Math.floor((screenHeight * 0.70) / cellSize);
      const cols = Math.floor(screenWidth / cellSize);
      setRows(rows);
      setCols(cols);
      setBoard(prevBoard => Array.from({ length: rows * cols }, (_, i) => prevBoard[i] || false));
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <main className={`${styles.mainContainer} ${currentTheme}-theme`}>
      <h1 className={`${styles.title} ${Tiny5.className}`}>Conway’s Game of Life</h1>
      <Controls
        running={running}
        setRunning={setRunning}
        resetBoard={resetBoard}
        idleRunning={idleRunning}
        setIdleRunning={setIdleRunning}
        setGlowMode={setGlowMode}
        glowMode={glowMode}
        toggleTheme={() => setCurrentTheme(prev => prev === "cyan" ? "green" : "cyan")}
        currentTheme={currentTheme}
      />
      <Board board={board} numRows={numRows} numCols={numCols} glowMode={glowMode} onCellClick={toggleCell} />
    </main>
  );
}
