"use client";
import { useState } from "react";
import styles from '@/app/page.module.css'

const numRows = 15;
const numCols = 30;

function generateBoard() {
  const rows = [];
  for (let i = 0; i < numRows; i++)
    rows.push(Array(numCols).fill(0));
  return rows;
}

export default function Home() {
  const [board, setBoard] = useState(generateBoard);

  return (
    <main className={styles.mainContainer}>
      <h1 className={styles.title}> Conway's Game of Life </h1>

      <div className={styles.gameContainer} style={{ gridTemplateColumns: `repeat(${numCols}, var(--cell-size))` }}>
        {board.map((row, i) =>
          row.map((cell, j) =>
            <div key={(i, j)} className={styles.cell} />
          )
        )}
      </div>
    </main>
  );
}
