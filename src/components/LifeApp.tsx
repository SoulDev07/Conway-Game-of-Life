"use client";

import dynamic from "next/dynamic";
import { parseAsString, parseAsStringEnum, useQueryState } from "nuqs";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import styles from "@/app/page.module.css";
import {
  LifeCanvas,
  PixelCursorTrail,
  SelectionHUD,
  SimulationControls,
  ToastCheckIcon,
  ToastCrossIcon,
  ToastInfoIcon,
} from "@/components";
import {
  BACKGROUND_OPTIONS,
  DEFAULT_BACKGROUND_KEY,
  DEFAULT_THEME_KEY,
  THEME_KEYS,
  THEMES,
} from "@/constants";
import { useSimulationContext } from "@/context";
import { useKeyboardShortcuts } from "@/hooks";
import {
  decodeSharedPattern,
  extractAllLiveCells,
  extractSelectionCells,
  parsePatternString,
} from "@/lib";
import type {
  BackgroundKey,
  CellCoordinate,
  GridSelection,
  PresetPattern,
  ThemeKey,
} from "@/types";

const PatternPicker = dynamic(
  () => import("@/components/patterns/PatternPicker").then((mod) => mod.PatternPicker),
  { ssr: false },
);

const ExportModal = dynamic(
  () => import("@/components/export/ExportModal").then((mod) => mod.ExportModal),
  { ssr: false },
);

export const LifeApp = () => {
  const [themeKey, setThemeKey] = useQueryState(
    "theme",
    parseAsStringEnum<ThemeKey>(THEME_KEYS).withDefault(DEFAULT_THEME_KEY),
  );
  const theme = THEMES[themeKey];

  const [bgKey, setBgKey] = useState<BackgroundKey>(DEFAULT_BACKGROUND_KEY);
  const bgOption = BACKGROUND_OPTIONS[bgKey];

  const [rleParam] = useQueryState("rle", parseAsString);

  const [glowMode, setGlowMode] = useState(false);
  const [patternPickerOpen, setPatternPickerOpen] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<PresetPattern | null>(null);

  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<GridSelection | null>(null);

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportCells, setExportCells] = useState<CellCoordinate[]>([]);
  const [exportPatternName, setExportPatternName] = useState("Custom Pattern");

  const urlCheckedRef = useRef(false);

  const {
    grid,
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
    loadPattern,
    resize,
    wrapEdges,
    toggleWrapEdges,
  } = useSimulationContext();

  // Parse shareable URL parameters (?rle=...&theme=...) on mount
  useEffect(() => {
    if (urlCheckedRef.current || !rleParam) return;
    urlCheckedRef.current = true;

    const patternString = decodeSharedPattern(rleParam);
    if (!patternString) return;

    try {
      const parsed = parsePatternString(patternString);
      if (parsed.grid.length > 0) {
        const loaded: PresetPattern = {
          name: parsed.name || "Shared Pattern",
          category: "Spaceship",
          description: parsed.description || `${parsed.width}×${parsed.height} pattern`,
          rle: patternString,
          grid: parsed.grid,
        };
        loadPattern(loaded);
        toast.success(`Pattern "${loaded.name}" loaded`);
      } else {
        toast.error("Shared pattern contains no live cells.");
      }
    } catch {
      toast.error("Failed to parse pattern.");
    }
  }, [rleParam, loadPattern]);

  const handleStampPattern = useCallback(
    (row: number, col: number) => {
      if (selectedPattern) {
        stamp(selectedPattern, row, col);
        setSelectedPattern(null);
      }
    },
    [selectedPattern, stamp],
  );

  const handleToggleSelect = useCallback(() => {
    setIsSelecting((prev) => {
      const next = !prev;
      if (!next) {
        setSelection(null);
      } else {
        setSelectedPattern(null);
      }
      return next;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelection(null);
    setIsSelecting(false);
  }, []);

  const handleOpenExport = useCallback(() => {
    if (selection) {
      const cells = extractSelectionCells(grid, selection);
      if (cells.length > 0) {
        setExportCells(cells);
        setExportPatternName("Selected Pattern");
        setExportModalOpen(true);
        return;
      }
      toast.error("Selection contains no live cells.");
      return;
    }

    const allLive = extractAllLiveCells(grid);
    if (allLive.length > 0) {
      setExportCells(allLive);
      setExportPatternName("My Pattern");
      setExportModalOpen(true);
      return;
    }

    toast.error("Grid is empty. Paint cells or stamp a pattern first.");
  }, [grid, selection]);

  const handleCancelAll = useCallback(() => {
    setSelectedPattern(null);
    setPatternPickerOpen(false);
    setExportModalOpen(false);
    setSelection(null);
    setIsSelecting(false);
  }, []);

  useKeyboardShortcuts({
    onTogglePlay: toggleRunning,
    onStep: step,
    onClear: () => {
      clear();
      setSelection(null);
    },
    onRandom: () => {
      randomize();
      setSelection(null);
    },
    onToggleGlow: () => setGlowMode((prev) => !prev),
    onTogglePatterns: () => setPatternPickerOpen((prev) => !prev),
    onToggleSelect: handleToggleSelect,
    onOpenExport: handleOpenExport,
    onCancel: handleCancelAll,
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

      <section className={styles.canvasContainer} aria-label="Game of Life grid canvas">
        <LifeCanvas
          grid={grid}
          theme={theme}
          bgColor={bgOption.color}
          glowMode={glowMode}
          onCellToggle={toggleCell}
          onStampPattern={handleStampPattern}
          onResize={resize}
          isStamping={selectedPattern !== null}
          selectedPattern={selectedPattern}
          isSelecting={isSelecting}
          selection={selection}
          onSelectionChange={setSelection}
        />
      </section>

      {selectedPattern && (
        <div
          className={styles.stampBanner}
          role="status"
          aria-live="polite"
          style={{
            background: theme.bgSecondary,
            borderColor: theme.accentColor,
            color: theme.textPrimary,
          }}
        >
          <span className={styles.stampText}>
            STAMP:{" "}
            <strong style={{ color: theme.accentColor }}>
              {selectedPattern.name.toUpperCase()}
            </strong>
            <span className={styles.stampHint}> • TAP GRID TO PLACE</span>
          </span>
          <button
            type="button"
            className={styles.cancelStampBtn}
            onClick={() => setSelectedPattern(null)}
            aria-label={`Cancel stamping ${selectedPattern.name}`}
            style={{
              borderColor: theme.accentColor,
              color: theme.accentColor,
            }}
          >
            CANCEL
          </button>
        </div>
      )}

      <footer className={styles.bottomSection}>
        <div className={styles.dockWrapper}>
          {selection && (
            <div className={styles.bannerContainer}>
              <SelectionHUD
                grid={grid}
                selection={selection}
                theme={theme}
                onClearSelection={handleClearSelection}
                onOpenExportModal={handleOpenExport}
              />
            </div>
          )}

          <SimulationControls
            running={running}
            onToggleRunning={toggleRunning}
            onStep={step}
            onClear={() => {
              clear();
              setSelection(null);
            }}
            onRandom={() => {
              randomize();
              setSelection(null);
            }}
            onOpenPresets={() => {
              setSelectedPattern(null);
              setPatternPickerOpen(true);
            }}
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
            generation={grid.generation}
            aliveCount={grid.aliveCount}
            theme={theme}
            isStamping={selectedPattern !== null}
            isSelecting={isSelecting}
            onToggleSelect={handleToggleSelect}
            wrapEdges={wrapEdges}
            onToggleWrapEdges={toggleWrapEdges}
          />
        </div>
        <p className={styles.hint} style={{ color: theme.textMuted }}>
          {selectedPattern
            ? `CLICK ON GRID TO STAMP [${selectedPattern.name.toUpperCase()}] • ESC TO CANCEL`
            : isSelecting
              ? "DRAG TO SELECT REGION • B TO TOGGLE SELECT • ESC TO DESELECT"
              : "DRAG TO PAINT • SPACE TO PLAY • B TO SELECT • P FOR PATTERNS"}
        </p>
      </footer>

      <PatternPicker
        isOpen={patternPickerOpen}
        onClose={() => setPatternPickerOpen(false)}
        onSelectPattern={(pattern) => {
          setSelectedPattern(pattern);
          setIsSelecting(false);
          setSelection(null);
        }}
        theme={theme}
      />

      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        theme={theme}
        themeKey={themeKey}
        cells={exportCells}
        defaultName={exportPatternName}
      />

      <Toaster
        position="top-center"
        theme="dark"
        style={
          {
            "--toast-accent": theme.accentColor,
            "--toast-glow": glowMode ? `${theme.accentColor}55` : `${theme.accentColor}25`,
          } as React.CSSProperties
        }
        icons={{
          success: <ToastCheckIcon color={theme.accentColor} glow={glowMode} />,
          error: <ToastCrossIcon color="#ff2453" glow={glowMode} />,
          info: <ToastInfoIcon color={theme.accentColor} glow={glowMode} />,
        }}
      />
    </main>
  );
};

export default LifeApp;
