"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  BACKGROUND_KEYS,
  BACKGROUND_OPTIONS,
  SPEED_PRESETS,
  THEME_KEYS,
  THEMES,
} from "@/constants";
import type { BackgroundKey, Theme, ThemeKey } from "@/types";
import styles from "./Controls.module.css";

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
  isStamping?: boolean;
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
  isStamping = false,
}) => {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [bgMenuOpen, setBgMenuOpen] = useState(false);

  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && (themeMenuOpen || bgMenuOpen)) {
        setThemeMenuOpen(false);
        setBgMenuOpen(false);
      }
    },
    [themeMenuOpen, bgMenuOpen],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

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
          onClick={onOpenPresets}
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

        <div className={styles.dropdownWrap}>
          <button
            type="button"
            className={styles.btn}
            onClick={() => {
              setThemeMenuOpen(!themeMenuOpen);
              setBgMenuOpen(false);
            }}
            style={{
              borderColor: theme.borderSubtle,
              color: theme.accentColor,
            }}
            aria-label="Select color theme"
            aria-haspopup="listbox"
            aria-expanded={themeMenuOpen}
            aria-controls="theme-menu-listbox"
          >
            {theme.name} ▾
          </button>

          {themeMenuOpen && (
            <>
              <div
                className={styles.backdrop}
                onClick={() => setThemeMenuOpen(false)}
                aria-hidden="true"
              />
              <div
                id="theme-menu-listbox"
                className={styles.menu}
                role="listbox"
                aria-label="Color theme options"
                style={{
                  background: theme.bgSecondary,
                  borderColor: theme.borderSubtle,
                }}
              >
                {THEME_KEYS.map((key) => {
                  const t = THEMES[key];
                  const isSelected = key === currentThemeKey;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={styles.menuOption}
                      onClick={() => {
                        onSelectTheme(key);
                        setThemeMenuOpen(false);
                      }}
                      style={{
                        color: isSelected ? t.accentColor : theme.textPrimary,
                        fontWeight: isSelected ? 700 : 400,
                      }}
                    >
                      <span
                        className={styles.themePreviewDot}
                        style={{ background: t.accentColor }}
                        aria-hidden="true"
                      />
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className={styles.dropdownWrap}>
          <button
            type="button"
            className={styles.btn}
            onClick={() => {
              setBgMenuOpen(!bgMenuOpen);
              setThemeMenuOpen(false);
            }}
            style={{
              borderColor: theme.borderSubtle,
              color: theme.textPrimary,
            }}
            aria-label="Select background color"
            aria-haspopup="listbox"
            aria-expanded={bgMenuOpen}
            aria-controls="bg-menu-listbox"
          >
            BG: {BACKGROUND_OPTIONS[currentBgKey].name} ▾
          </button>

          {bgMenuOpen && (
            <>
              <div
                className={styles.backdrop}
                onClick={() => setBgMenuOpen(false)}
                aria-hidden="true"
              />
              <div
                id="bg-menu-listbox"
                className={styles.menu}
                role="listbox"
                aria-label="Background color options"
                style={{
                  background: theme.bgSecondary,
                  borderColor: theme.borderSubtle,
                }}
              >
                {BACKGROUND_KEYS.map((key) => {
                  const bg = BACKGROUND_OPTIONS[key];
                  const isSelected = key === currentBgKey;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={styles.menuOption}
                      onClick={() => {
                        onSelectBg(key);
                        setBgMenuOpen(false);
                      }}
                      style={{
                        color: isSelected ? theme.accentColor : theme.textPrimary,
                        fontWeight: isSelected ? 700 : 400,
                      }}
                    >
                      <span
                        className={styles.bgPreviewDot}
                        style={{ background: bg.color }}
                        aria-hidden="true"
                      />
                      {bg.name}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

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
