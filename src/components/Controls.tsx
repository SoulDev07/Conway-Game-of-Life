import React from "react";
import styles from './controls.module.css';

interface ControlsProps {
  running: boolean;
  setRunning: (running: boolean) => void;
  resetBoard: () => void;
  idleRunning: boolean;
  setIdleRunning: (idleRunning: boolean) => void;
  setGlowMode: (glowMode: boolean) => void;
  glowMode: boolean;
  toggleTheme: () => void;
  currentTheme: "cyan" | "green";
}

const Controls: React.FC<ControlsProps> = ({ running, setRunning, resetBoard, idleRunning, setIdleRunning, setGlowMode, glowMode, toggleTheme, currentTheme }) => (
  <div className={styles.btnList}>
    <button className={styles.btn} onClick={() => setRunning(!running)}>
      {running ? 'Stop' : 'Start'}
    </button>
    <button className={styles.btn} onClick={resetBoard}>Reset</button>
    <button className={styles.btn} onClick={() => { setIdleRunning(!idleRunning); setRunning(true); }}>
      {idleRunning ? 'Stop Idle' : 'Start Idle'}
    </button>
    <button className={styles.btn} onClick={() => setGlowMode(!glowMode)}>
      {glowMode ? 'Disable Glow' : 'Enable Glow'}
    </button>
    <button className={styles.btn} onClick={toggleTheme}>
      {currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}
    </button>
  </div>
);

export default Controls;
