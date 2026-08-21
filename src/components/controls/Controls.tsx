"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BACKGROUND_KEYS,
  BACKGROUND_OPTIONS,
  SPEED_PRESETS,
  THEME_KEYS,
  THEMES,
} from "@/constants";
import type { BackgroundKey, Theme, ThemeKey } from "@/types";
import styles from "./Controls.module.css";
import { DropdownMenu, type DropdownOption } from "./DropdownMenu";

interface ControlsProps {
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
}

export const Controls: React.FC<ControlsProps> = ({
  running,
  onToggleRunning,
  onStep,
  onClear,
  onRandom,
  onOpenPresets,
  idleRunning,
  onToggleIdle,
  glowMode,
  onToggleGlow,
  speed,
  onChangeSpeed,
  currentThemeKey,
  onSelectTheme,
  currentBgKey,
  onSelectBg,
  generation,
  aliveCount,
  theme,
  isStamping,
}) => {
  const [openMenu, setOpenMenu] = useState<"theme" | "bg" | null>(null);

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

  return (
    <div
      className={styles.dock}
      role="toolbar"
      aria-label="Simulation controls"
      style={{
        background: theme.bgSecondary,
        borderColor: theme.borderSubtle,
      }}
    >
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
      </div>

      <div
        className={styles.divider}
        style={{ background: theme.borderSubtle }}
        aria-hidden="true"
      />

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
          }}
          aria-label="Toggle cell glow effect"
        >
          {glowMode ? "Glow: ON" : "Glow"}
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

        <div className={styles.speedWrap}>
          <select
            id="speed-select"
            aria-label="Simulation speed"
            className={styles.select}
            value={speed}
            onChange={(e) => onChangeSpeed(Number(e.target.value))}
            style={{
              borderColor: theme.borderSubtle,
              color: theme.textPrimary,
              background: theme.bgSecondary,
            }}
          >
            {SPEED_PRESETS.map((p) => (
              <option key={p.ms} value={p.ms}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className={styles.divider}
        style={{ background: theme.borderSubtle }}
        aria-hidden="true"
      />

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
    </div>
  );
};

export default Controls;
