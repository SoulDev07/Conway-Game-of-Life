"use client";

import type React from "react";
import { PATTERN_PRESETS } from "@/constants";
import type { PresetPattern, Theme } from "@/types";
import styles from "./PatternPicker.module.css";

interface PatternPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPattern: (pattern: PresetPattern) => void;
  theme: Theme;
}

export const PatternPicker: React.FC<PatternPickerProps> = ({
  isOpen,
  onClose,
  onSelectPattern,
  theme,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.bgSecondary,
          borderColor: theme.borderSubtle,
        }}
      >
        <div className={styles.header}>
          <h2 className={styles.title} style={{ color: theme.accentColor }}>
            SELECT PATTERN
          </h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            style={{ color: theme.textMuted }}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <p className={styles.subtitle} style={{ color: theme.textMuted }}>
          Click a pattern to stamp it on the grid.
        </p>

        <div className={styles.grid}>
          {PATTERN_PRESETS.map((p) => (
            <div
              key={p.name}
              className={styles.card}
              onClick={() => {
                onSelectPattern(p);
                onClose();
              }}
              style={{
                borderColor: theme.borderSubtle,
              }}
            >
              <div className={styles.cardHeader}>
                <span className={styles.patternName} style={{ color: theme.textPrimary }}>
                  {p.name.toUpperCase()}
                </span>
                <span
                  className={styles.categoryBadge}
                  style={{
                    color: theme.accentColor,
                    borderColor: theme.borderSubtle,
                  }}
                >
                  {p.category.toUpperCase()}
                </span>
              </div>
              <p className={styles.cardDesc} style={{ color: theme.textMuted }}>
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatternPicker;
