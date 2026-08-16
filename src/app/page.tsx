"use client";

import { useCallback, useState } from "react";
import { Controls, LifeCanvas, PatternPicker, PixelCursorTrail } from "@/components";
import { BACKGROUND_OPTIONS, DEFAULT_BACKGROUND_KEY, DEFAULT_THEME_KEY, THEMES } from "@/constants";
import { useGameSimulation, useKeyboardShortcuts } from "@/hooks";
import type { BackgroundKey, PresetPattern, ThemeKey } from "@/types";
import styles from "./page.module.css";

export default function Home() {
  const [themeKey, setThemeKey] = useState<ThemeKey>(DEFAULT_THEME_KEY);
  const theme = THEMES[themeKey];

  const [bgKey, setBgKey] = useState<BackgroundKey>(DEFAULT_BACKGROUND_KEY);
  const bgOption = BACKGROUND_OPTIONS[bgKey];

  const [glowMode, setGlowMode] = useState(true);
  const [patternPickerOpen, setPatternPickerOpen] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<PresetPattern | null>(null);

  const {
    board,
    running,
    idleRunning,
    speed,
    toggleRunning,
    toggleIdle,
    step,
    clear,
    randomize,
    setSpeed,
    toggleCell,
    stamp,
    resize,
  } = useGameSimulation(16, 32);

  const handleStampPattern = useCallback(
    (row: number, col: number) => {
      if (selectedPattern) {
        stamp(selectedPattern, row, col);
        setSelectedPattern(null);
      }
    },
    [selectedPattern, stamp],
  );

  useKeyboardShortcuts({
    onTogglePlay: toggleRunning,
    onStep: step,
    onClear: clear,
    onRandom: randomize,
    onToggleGlow: () => setGlowMode((prev) => !prev),
    onTogglePatterns: () => setPatternPickerOpen((prev) => !prev),
    onCancel: () => {
      setSelectedPattern(null);
      setPatternPickerOpen(false);
    },
    isRunning: running,
  });

  return (
    <main
      className={styles.main}
      style={{
        backgroundColor: bgOption.color,
        color: theme.textPrimary,
      }}
    >
      <PixelCursorTrail theme={theme} glowMode={glowMode} />

      <header className={styles.topSection}>
        <h1 className={styles.title} style={{ color: theme.textPrimary }}>
          Conway’s Game of Life
        </h1>
      </header>

      <div className={styles.canvasContainer}>
        <LifeCanvas
          board={board}
          theme={theme}
          bgColor={bgOption.color}
          glowMode={glowMode}
          onCellToggle={toggleCell}
          onStampPattern={handleStampPattern}
          onResize={resize}
          isStamping={selectedPattern !== null}
        />
      </div>

      <footer className={styles.bottomSection}>
        <div className={styles.dockWrapper}>
          <Controls
            running={running}
            onToggleRunning={toggleRunning}
            onStep={step}
            onClear={clear}
            onRandom={randomize}
            onOpenPresets={() => setPatternPickerOpen(true)}
            idleRunning={idleRunning}
            onToggleIdle={toggleIdle}
            glowMode={glowMode}
            onToggleGlow={() => setGlowMode((prev) => !prev)}
            speed={speed}
            onChangeSpeed={setSpeed}
            currentThemeKey={themeKey}
            onSelectTheme={setThemeKey}
            currentBgKey={bgKey}
            onSelectBg={setBgKey}
            generation={board.generation}
            aliveCount={board.aliveCount}
            theme={theme}
          />
        </div>
        <p className={styles.hint} style={{ color: theme.textMuted }}>
          {selectedPattern
            ? `CLICK ON GRID TO STAMP [${selectedPattern.name.toUpperCase()}] • ESC TO CANCEL`
            : "DRAG TO PAINT • SPACE TO PLAY • P FOR PATTERNS • G FOR GLOW"}
        </p>
      </footer>

      <PatternPicker
        isOpen={patternPickerOpen}
        onClose={() => setPatternPickerOpen(false)}
        onSelectPattern={(pattern) => setSelectedPattern(pattern)}
        theme={theme}
      />
    </main>
  );
}
