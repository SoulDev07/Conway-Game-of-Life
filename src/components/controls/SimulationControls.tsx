"use client";

import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  BACKGROUND_KEYS,
  BACKGROUND_OPTIONS,
  SPEED_PRESETS,
  THEME_KEYS,
  THEMES,
} from "@/constants";
import type { BackgroundKey, Theme, ThemeKey } from "@/types";

import { DropdownMenu, type DropdownOption } from "./DropdownMenu";
import styles from "./SimulationControls.module.css";

export interface SimulationControlsProps {
  running: boolean;
  onToggleRunning: () => void;
  onStep: () => void;
  onClear: () => void;
  onRandom: () => void;
  onOpenPresets: () => void;
  idleRunning: boolean;
  onToggleIdle: () => void;
  glowMode: boolean;
  onToggleGlow: () => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  currentThemeKey: ThemeKey;
  onSelectTheme: (key: ThemeKey) => void;
  currentBgKey: BackgroundKey;
  onSelectBg: (key: BackgroundKey) => void;
  generation: number;
  aliveCount: number;
  theme: Theme;
  isStamping: boolean;
  isSelecting: boolean;
  onToggleSelect: () => void;
  wrapEdges: boolean;
  onToggleWrapEdges: () => void;
  ruleId?: string;
  onSelectRule?: (ruleId: string) => void;
}

interface ControlsContextValue extends SimulationControlsProps {
  openMenu: "theme" | "bg" | "speed" | null;
  setOpenMenu: React.Dispatch<React.SetStateAction<"theme" | "bg" | "speed" | null>>;
}

const ControlsContext = createContext<ControlsContextValue | null>(null);

function useControlsContext() {
  const ctx = useContext(ControlsContext);
  if (!ctx) {
    throw new Error("SimulationControls subcomponents must be rendered within SimulationControls");
  }
  return ctx;
}

// ----------------------------------------------------
// Subcomponents
// ----------------------------------------------------

export const PlaybackControls = () => {
  const {
    running,
    onToggleRunning,
    onStep,
    onClear,
    onRandom,
    onOpenPresets,
    isStamping,
    isSelecting,
    onToggleSelect,
    theme,
    setOpenMenu,
  } = useControlsContext();

  return (
    <div className={styles.group}>
      <button
        type="button"
        className={`${styles.btn} ${styles.primaryBtn} ${running ? styles.activeBtn : ""}`}
        onClick={onToggleRunning}
        aria-pressed={running}
        style={{
          borderColor: running ? theme.accentColor : theme.borderSubtle,
          color: running ? theme.bgColor : theme.textPrimary,
          background: running ? theme.accentColor : "transparent",
        }}
        aria-label={running ? "Pause simulation" : "Start simulation"}
      >
        {running ? "Stop" : "Start"}
      </button>

      <button
        type="button"
        className={styles.btn}
        onClick={onStep}
        disabled={running}
        style={{
          borderColor: theme.borderSubtle,
          color: theme.textPrimary,
          opacity: running ? 0.35 : 1,
        }}
        aria-label="Step simulation forward one generation"
      >
        Step
      </button>

      <button
        type="button"
        className={styles.btn}
        onClick={onClear}
        style={{
          borderColor: theme.borderSubtle,
          color: theme.textPrimary,
        }}
        aria-label="Clear grid"
      >
        Reset
      </button>

      <button
        type="button"
        className={styles.btn}
        onClick={onRandom}
        style={{
          borderColor: theme.borderSubtle,
          color: theme.textPrimary,
        }}
        aria-label="Randomize board cells"
      >
        Random
      </button>

      <button
        type="button"
        className={`${styles.btn} ${isStamping ? styles.activeToggle : ""}`}
        onClick={() => {
          setOpenMenu(null);
          onOpenPresets();
        }}
        aria-haspopup="dialog"
        aria-pressed={isStamping}
        style={{
          borderColor: isStamping ? theme.accentColor : theme.borderSubtle,
          color: isStamping ? theme.accentColor : theme.textPrimary,
          background: isStamping ? "rgba(255, 255, 255, 0.08)" : "transparent",
        }}
        aria-label="Open pattern presets library"
      >
        Patterns
      </button>

      <button
        type="button"
        className={`${styles.btn} ${isSelecting ? styles.activeToggle : ""}`}
        onClick={() => {
          setOpenMenu(null);
          onToggleSelect();
        }}
        aria-pressed={isSelecting}
        style={{
          borderColor: isSelecting ? theme.accentColor : theme.borderSubtle,
          color: isSelecting ? theme.accentColor : theme.textPrimary,
          background: isSelecting ? "rgba(255, 255, 255, 0.08)" : "transparent",
          minWidth: "86px",
        }}
        aria-label="Toggle box select tool"
        title="Box Select tool (drag on grid to select region)"
      >
        {isSelecting ? "Select: ON" : "Select"}
      </button>
    </div>
  );
};

export const MenuControls = () => {
  const {
    idleRunning,
    onToggleIdle,
    glowMode,
    onToggleGlow,
    wrapEdges,
    onToggleWrapEdges,
    speed,
    onChangeSpeed,
    currentThemeKey,
    onSelectTheme,
    currentBgKey,
    onSelectBg,
    theme,
    openMenu,
    setOpenMenu,
  } = useControlsContext();

  const themeOptions = useMemo<DropdownOption<ThemeKey>[]>(
    () =>
      THEME_KEYS.map((key) => ({
        key,
        label: THEMES[key].name,
        dotColor: THEMES[key].accentColor,
      })),
    [],
  );

  const bgOptions = useMemo<DropdownOption<BackgroundKey>[]>(
    () =>
      BACKGROUND_KEYS.map((key) => ({
        key,
        label: BACKGROUND_OPTIONS[key].name,
        dotColor: BACKGROUND_OPTIONS[key].color,
      })),
    [],
  );

  const speedOptions = useMemo<DropdownOption<number>[]>(
    () =>
      SPEED_PRESETS.map((p) => ({
        key: p.ms,
        label: p.label,
      })),
    [],
  );

  const currentSpeedLabel = useMemo(() => {
    const currentPreset = SPEED_PRESETS.find((p) => p.ms === speed);
    return currentPreset ? currentPreset.label : `${speed}ms`;
  }, [speed]);

  return (
    <div className={styles.group}>
      <button
        type="button"
        className={`${styles.btn} ${idleRunning ? styles.activeToggle : ""}`}
        onClick={onToggleIdle}
        aria-pressed={idleRunning}
        style={{
          borderColor: idleRunning ? theme.accentColor : theme.borderSubtle,
          color: idleRunning ? theme.accentColor : theme.textPrimary,
          background: idleRunning ? "rgba(255, 255, 255, 0.08)" : "transparent",
          minWidth: "76px",
        }}
        aria-label="Toggle idle pattern generation"
      >
        {idleRunning ? "Idle: ON" : "Idle"}
      </button>

      <button
        type="button"
        className={`${styles.btn} ${glowMode ? styles.activeToggle : ""}`}
        onClick={onToggleGlow}
        aria-pressed={glowMode}
        style={{
          borderColor: glowMode ? theme.accentColor : theme.borderSubtle,
          color: glowMode ? theme.accentColor : theme.textPrimary,
          background: glowMode ? "rgba(255, 255, 255, 0.08)" : "transparent",
          minWidth: "76px",
        }}
        aria-label="Toggle cell glow effect"
      >
        {glowMode ? "Glow: ON" : "Glow"}
      </button>

      <button
        type="button"
        className={`${styles.btn} ${wrapEdges ? styles.activeToggle : ""}`}
        onClick={onToggleWrapEdges}
        aria-pressed={wrapEdges}
        style={{
          borderColor: wrapEdges ? theme.accentColor : theme.borderSubtle,
          color: wrapEdges ? theme.accentColor : theme.textPrimary,
          background: wrapEdges ? "rgba(255, 255, 255, 0.08)" : "transparent",
          minWidth: "76px",
        }}
        aria-label="Toggle toroidal wrap border mode"
        title={
          wrapEdges ? "Toroidal wrap edges enabled" : "Bounded edges enabled (cells die at border)"
        }
      >
        {wrapEdges ? "Wrap: ON" : "Wrap: OFF"}
      </button>

      <DropdownMenu
        id="theme-menu-listbox"
        label={theme.name}
        value={currentThemeKey}
        options={themeOptions}
        isOpen={openMenu === "theme"}
        onToggle={() => setOpenMenu((prev) => (prev === "theme" ? null : "theme"))}
        onClose={() => setOpenMenu(null)}
        onSelect={onSelectTheme}
        theme={theme}
        textColor={theme.accentColor}
      />

      <DropdownMenu
        id="bg-menu-listbox"
        label={`BG: ${BACKGROUND_OPTIONS[currentBgKey].name}`}
        value={currentBgKey}
        options={bgOptions}
        isOpen={openMenu === "bg"}
        onToggle={() => setOpenMenu((prev) => (prev === "bg" ? null : "bg"))}
        onClose={() => setOpenMenu(null)}
        onSelect={onSelectBg}
        theme={theme}
      />

      <DropdownMenu
        id="speed-menu-listbox"
        label={currentSpeedLabel}
        value={speed}
        options={speedOptions}
        isOpen={openMenu === "speed"}
        onToggle={() => setOpenMenu((prev) => (prev === "speed" ? null : "speed"))}
        onClose={() => setOpenMenu(null)}
        onSelect={onChangeSpeed}
        theme={theme}
      />
    </div>
  );
};

export const StatsDisplay = () => {
  const { generation, aliveCount, theme } = useControlsContext();

  return (
    <div className={styles.statsInline} role="status" aria-live="polite" aria-atomic="true">
      <span className={styles.statLabel} style={{ color: theme.textMuted }}>
        GEN:
      </span>
      <span className={styles.statVal} style={{ color: theme.textPrimary }}>
        {generation}
      </span>
      <span className={styles.statLabel} style={{ color: theme.textMuted }}>
        ALIVE:
      </span>
      <span className={styles.statVal} style={{ color: theme.accentColor }}>
        {aliveCount}
      </span>
    </div>
  );
};

// ----------------------------------------------------
// Main Component with Compound Properties
// ----------------------------------------------------

export const SimulationControls = (props: SimulationControlsProps) => {
  const [openMenu, setOpenMenu] = useState<"theme" | "bg" | "speed" | null>(null);

  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && openMenu !== null) {
        setOpenMenu(null);
      }
    },
    [openMenu],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  const contextValue = useMemo(
    () => ({
      ...props,
      openMenu,
      setOpenMenu,
    }),
    [props, openMenu],
  );

  return (
    <ControlsContext.Provider value={contextValue}>
      <div
        className={styles.dock}
        role="toolbar"
        aria-label="Simulation controls"
        style={{
          background: props.theme.bgSecondary,
          borderColor: props.theme.borderSubtle,
        }}
      >
        <PlaybackControls />
        <div
          className={styles.divider}
          style={{ background: props.theme.borderSubtle }}
          aria-hidden="true"
        />
        <MenuControls />
        <div
          className={styles.divider}
          style={{ background: props.theme.borderSubtle }}
          aria-hidden="true"
        />
        <StatsDisplay />
      </div>
    </ControlsContext.Provider>
  );
};

// Attach compound parts
SimulationControls.Playback = PlaybackControls;
SimulationControls.Menus = MenuControls;
SimulationControls.Stats = StatsDisplay;

export default SimulationControls;
