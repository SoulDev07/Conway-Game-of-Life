"use client";

import type React from "react";
import { useState } from "react";
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
}) => {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [bgMenuOpen, setBgMenuOpen] = useState(false);

  return (
    <div
      className={styles.dock}
      style={{
        background: theme.bgSecondary,
        borderColor: theme.borderSubtle,
      }}
    >
      <div className={styles.group}>
        <button
          className={`${styles.btn} ${running ? styles.activeBtn : ""}`}
          onClick={onToggleRunning}
          style={{
            borderColor: running ? theme.accentColor : theme.borderSubtle,
            color: running ? theme.bgColor : theme.textPrimary,
            background: running ? theme.accentColor : "transparent",
          }}
        >
          {running ? "Stop" : "Start"}
        </button>

        <button
          className={styles.btn}
          onClick={onClear}
          style={{
            borderColor: theme.borderSubtle,
            color: theme.textPrimary,
          }}
        >
          Reset
        </button>

        <button
          className={styles.btn}
          onClick={onStep}
          disabled={running}
          style={{
            borderColor: theme.borderSubtle,
            color: theme.textPrimary,
            opacity: running ? 0.3 : 1,
          }}
        >
          Step
        </button>
      </div>

      <div className={styles.divider} style={{ background: theme.borderSubtle }} />

      <div className={styles.group}>
        <button
          className={styles.btn}
          onClick={onRandom}
          style={{
            borderColor: theme.borderSubtle,
            color: theme.textPrimary,
          }}
        >
          Random
        </button>

        <button
          className={styles.btn}
          onClick={onOpenPresets}
          style={{
            borderColor: theme.borderSubtle,
            color: theme.textPrimary,
          }}
        >
          Patterns
        </button>

        <button
          className={`${styles.btn} ${idleRunning ? styles.activeToggle : ""}`}
          onClick={onToggleIdle}
          style={{
            borderColor: idleRunning ? theme.accentColor : theme.borderSubtle,
            color: idleRunning ? theme.accentColor : theme.textPrimary,
            background: idleRunning ? "rgba(255, 255, 255, 0.08)" : "transparent",
          }}
        >
          {idleRunning ? "Stop Idle" : "Start Idle"}
        </button>
      </div>

      <div className={styles.divider} style={{ background: theme.borderSubtle }} />

      <div className={styles.group}>
        <button
          className={`${styles.btn} ${glowMode ? styles.activeToggle : ""}`}
          onClick={onToggleGlow}
          style={{
            borderColor: glowMode ? theme.accentColor : theme.borderSubtle,
            color: glowMode ? theme.accentColor : theme.textPrimary,
            background: glowMode ? "rgba(255, 255, 255, 0.08)" : "transparent",
          }}
        >
          {glowMode ? "Disable Glow" : "Enable Glow"}
        </button>

        <div className={styles.dropdownWrap}>
          <button
            className={styles.btn}
            onClick={() => {
              setThemeMenuOpen(!themeMenuOpen);
              setBgMenuOpen(false);
            }}
            style={{
              borderColor: theme.borderSubtle,
              color: theme.accentColor,
            }}
          >
            {theme.name} ▾
          </button>

          {themeMenuOpen && (
            <>
              <div className={styles.backdrop} onClick={() => setThemeMenuOpen(false)} />
              <div
                className={styles.menu}
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
                      className={styles.menuOption}
                      onClick={() => {
                        onSelectTheme(key);
                        setThemeMenuOpen(false);
                      }}
                      style={{
                        color: isSelected ? t.accentColor : theme.textPrimary,
                      }}
                    >
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
            className={styles.btn}
            onClick={() => {
              setBgMenuOpen(!bgMenuOpen);
              setThemeMenuOpen(false);
            }}
            style={{
              borderColor: theme.borderSubtle,
              color: theme.textPrimary,
            }}
          >
            BG: {BACKGROUND_OPTIONS[currentBgKey].name} ▾
          </button>

          {bgMenuOpen && (
            <>
              <div className={styles.backdrop} onClick={() => setBgMenuOpen(false)} />
              <div
                className={styles.menu}
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
                      className={styles.menuOption}
                      onClick={() => {
                        onSelectBg(key);
                        setBgMenuOpen(false);
                      }}
                      style={{
                        color: isSelected ? theme.accentColor : theme.textPrimary,
                      }}
                    >
                      <span className={styles.bgPreviewDot} style={{ background: bg.color }} />
                      {bg.name}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <div className={styles.divider} style={{ background: theme.borderSubtle }} />

      <div className={styles.group}>
        <div className={styles.speedWrap}>
          <select
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

        <div className={styles.statsInline}>
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
    </div>
  );
};

export default Controls;
