"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PATTERN_PRESETS } from "@/constants";
import { getPatternBounds } from "@/lib";
import type { PatternCategory, PresetPattern, Theme } from "@/types";
import { PatternImport } from "./PatternImport";
import styles from "./PatternPicker.module.css";

const CATEGORIES: Array<"All" | PatternCategory> = [
  "All",
  "Spaceship",
  "Gun",
  "Oscillator",
  "Still Life",
  "Methuselah",
];

interface PatternPreviewProps {
  pattern: PresetPattern;
  color: string;
}

const PatternPreview = ({ pattern, color }: PatternPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "60px" },
    );

    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { minR, minC, width: pCols, height: pRows } = getPatternBounds(pattern);

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const padding = 4;
    const availableW = width - padding * 2;
    const availableH = height - padding * 2;

    const cellSize = Math.max(
      2,
      Math.min(8, Math.floor(Math.min(availableW / pCols, availableH / pRows))),
    );

    const patternDrawW = pCols * cellSize;
    const patternDrawH = pRows * cellSize;
    const startX = Math.floor((width - patternDrawW) / 2);
    const startY = Math.floor((height - patternDrawH) / 2);

    ctx.fillStyle = color;
    for (const [r, c] of pattern.grid) {
      const x = startX + (c - minC) * cellSize;
      const y = startY + (r - minR) * cellSize;
      ctx.fillRect(x, y, Math.max(1, cellSize - 1), Math.max(1, cellSize - 1));
    }
  }, [pattern, color, isVisible]);

  return <canvas ref={canvasRef} width={48} height={48} className={styles.previewCanvas} />;
};

export interface PatternPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPattern: (pattern: PresetPattern) => void;
  theme: Theme;
}

export const PatternPicker = ({ isOpen, onClose, onSelectPattern, theme }: PatternPickerProps) => {
  const [activeTab, setActiveTab] = useState<"library" | "import">("library");
  const [selectedCategory, setSelectedCategory] = useState<"All" | PatternCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const modalRef = useRef<HTMLDivElement | null>(null);

  const filteredPatterns = useMemo(() => {
    return PATTERN_PRESETS.filter((p) => {
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pattern-picker-title"
        aria-describedby="pattern-picker-desc"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.bgSecondary,
          borderColor: theme.borderSubtle,
        }}
      >
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <h2
              id="pattern-picker-title"
              className={styles.title}
              style={{ color: theme.accentColor }}
            >
              {activeTab === "library" ? "SELECT PATTERN" : "IMPORT PATTERN"}
            </h2>
            {activeTab === "library" && (
              <span className={styles.countBadge} style={{ color: theme.textMuted }}>
                ({filteredPatterns.length})
              </span>
            )}
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            style={{ color: theme.textMuted }}
            aria-label="Close pattern picker"
          >
            ✕
          </button>
        </div>

        <p id="pattern-picker-desc" className={styles.subtitle} style={{ color: theme.textMuted }}>
          {activeTab === "library"
            ? "Choose a pattern to stamp onto the grid."
            : "Import a custom pattern from LifeWiki RLE or .cells format."}
        </p>

        <div className={styles.tabBar} role="tablist" aria-label="Pattern picker tabs">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "library"}
            className={`${styles.tabBtn} ${activeTab === "library" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("library")}
            style={{
              borderColor: activeTab === "library" ? theme.accentColor : theme.borderSubtle,
              color: activeTab === "library" ? theme.accentColor : theme.textMuted,
              background: activeTab === "library" ? "rgba(255,255,255,0.08)" : "transparent",
            }}
          >
            Library
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "import"}
            className={`${styles.tabBtn} ${activeTab === "import" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("import")}
            style={{
              borderColor: activeTab === "import" ? theme.accentColor : theme.borderSubtle,
              color: activeTab === "import" ? theme.accentColor : theme.textMuted,
              background: activeTab === "import" ? "rgba(255,255,255,0.08)" : "transparent",
            }}
          >
            Import RLE
          </button>
        </div>

        {activeTab === "library" && (
          <>
            <div className={styles.filterSection}>
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Search patterns..."
                aria-label="Search pattern presets"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  borderColor: theme.borderSubtle,
                  color: theme.textPrimary,
                  background: theme.bgColor,
                }}
              />

              <div
                className={styles.categoryTabs}
                role="tablist"
                aria-label="Filter patterns by category"
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      className={`${styles.categoryTab} ${isSelected ? styles.categoryTabActive : ""}`}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        borderColor: isSelected ? theme.accentColor : theme.borderSubtle,
                        color: isSelected ? theme.accentColor : theme.textMuted,
                        background: isSelected ? "rgba(255, 255, 255, 0.08)" : "transparent",
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.grid} role="listbox" aria-label="Available patterns">
              {filteredPatterns.length === 0 ? (
                <div className={styles.emptyState} style={{ color: theme.textMuted }}>
                  No patterns found matching &quot;{searchQuery}&quot;
                </div>
              ) : (
                filteredPatterns.map((p) => (
                  <div
                    key={p.name}
                    role="option"
                    aria-selected={false}
                    tabIndex={0}
                    className={styles.card}
                    onClick={() => {
                      onSelectPattern(p);
                      onClose();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectPattern(p);
                        onClose();
                      }
                    }}
                    style={{
                      borderColor: theme.borderSubtle,
                    }}
                  >
                    <div className={styles.cardLeft}>
                      <PatternPreview pattern={p} color={theme.cellColor} />
                    </div>
                    <div className={styles.cardRight}>
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
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === "import" && (
          <PatternImport theme={theme} onSelectPattern={onSelectPattern} onClose={onClose} />
        )}
      </div>
    </div>
  );
};

export default PatternPicker;
