"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { parsePatternString, RLEParseError } from "@/lib";
import type { PatternCategory, PresetPattern, Theme } from "@/types";
import styles from "./PatternImport.module.css";

interface PatternImportProps {
  theme: Theme;
  onSelectPattern: (pattern: PresetPattern) => void;
  onClose: () => void;
}

export const PatternImport: React.FC<PatternImportProps> = ({
  theme,
  onSelectPattern,
  onClose,
}) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PresetPattern | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const parse = useCallback((src: string) => {
    if (!src.trim()) {
      setPreview(null);
      setError(null);
      return;
    }
    try {
      const result = parsePatternString(src);
      if (result.grid.length === 0) {
        setError("Pattern has no live cells.");
        setPreview(null);
        return;
      }
      const pattern: PresetPattern = {
        name: result.name || "Custom Pattern",
        category: "Spaceship" as PatternCategory,
        description: result.description || `${result.width}×${result.height}, rule ${result.rule}`,
        rle: src.trim(),
        grid: result.grid,
      };
      setPreview(pattern);
      setError(null);
    } catch (err) {
      setError(err instanceof RLEParseError ? err.message : "Failed to parse pattern.");
      setPreview(null);
    }
  }, []);

  useEffect(() => {
    parse(input);
  }, [input, parse]);

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !preview) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { grid } = preview;
    let minR = Number.POSITIVE_INFINITY;
    let maxR = Number.NEGATIVE_INFINITY;
    let minC = Number.POSITIVE_INFINITY;
    let maxC = Number.NEGATIVE_INFINITY;

    for (const [r, c] of grid) {
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
      if (c < minC) minC = c;
      if (c > maxC) maxC = c;
    }

    const pRows = maxR - minR + 1;
    const pCols = maxC - minC + 1;
    const w = canvas.width;
    const h = canvas.height;
    const padding = 8;
    const cellSize = Math.max(
      2,
      Math.min(10, Math.floor(Math.min((w - padding * 2) / pCols, (h - padding * 2) / pRows))),
    );
    const drawW = pCols * cellSize;
    const drawH = pRows * cellSize;
    const startX = Math.floor((w - drawW) / 2);
    const startY = Math.floor((h - drawH) / 2);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = theme.cellColor;
    for (const [r, c] of grid) {
      ctx.fillRect(
        startX + (c - minC) * cellSize,
        startY + (r - minR) * cellSize,
        Math.max(1, cellSize - 1),
        Math.max(1, cellSize - 1),
      );
    }
  }, [preview, theme.cellColor]);

  const handleFile = useCallback((file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      setError("File is too large (maximum size is 2MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") setInput(text);
    };
    reader.onerror = () => {
      setError("Failed to read file.");
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleStamp = () => {
    if (preview) {
      onSelectPattern(preview);
      onClose();
    }
  };

  return (
    <div className={styles.container}>
      <p className={styles.hint} style={{ color: theme.textMuted }}>
        Paste an RLE string or .cells text from{" "}
        <a
          href="https://conwaylife.com/wiki/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: theme.accentColor }}
        >
          LifeWiki
        </a>
        , or drop a <code>.rle</code> / <code>.cells</code> file below.
      </p>

      <label
        className={styles.dropZone}
        style={{ borderColor: theme.borderSubtle }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        aria-label="Drop or click to upload a .rle or .cells file"
      >
        <span style={{ color: theme.textMuted }}>
          Drop .rle / .cells file here or click to browse
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".rle,.cells,.lif,.life"
          className={styles.fileInput}
          aria-hidden="true"
          tabIndex={-1}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </label>

      <textarea
        className={styles.textarea}
        placeholder={
          "Paste RLE pattern here...\n\nExample (Glider):\nx = 3, y = 3, rule = B3/S23\nbob$2bo$3o!"
        }
        value={input}
        onChange={(e) => setInput(e.target.value)}
        aria-label="Paste RLE or plaintext pattern string"
        style={{
          borderColor: error ? "rgba(255,80,80,0.6)" : theme.borderSubtle,
          color: theme.textPrimary,
          background: "rgba(0,0,0,0.25)",
        }}
        spellCheck={false}
      />

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {preview && (
        <div className={styles.previewRow}>
          <div className={styles.previewCanvasWrap} style={{ borderColor: theme.borderSubtle }}>
            <canvas
              ref={previewCanvasRef}
              width={120}
              height={120}
              className={styles.previewCanvas}
              aria-label="Pattern preview"
            />
          </div>
          <div className={styles.previewMeta}>
            <span className={styles.previewName} style={{ color: theme.accentColor }}>
              {preview.name.toUpperCase()}
            </span>
            <span className={styles.previewDesc} style={{ color: theme.textMuted }}>
              {preview.description}
            </span>
            <span className={styles.cellCount} style={{ color: theme.textMuted }}>
              {preview.grid.length} live cells
            </span>
          </div>
        </div>
      )}

      <button
        type="button"
        className={styles.stampBtn}
        disabled={!preview}
        onClick={handleStamp}
        style={{
          borderColor: preview ? theme.accentColor : theme.borderSubtle,
          color: preview ? theme.accentColor : theme.textMuted,
          background: preview ? "rgba(255,255,255,0.06)" : "transparent",
        }}
      >
        {preview ? `STAMP "${preview.name.toUpperCase()}"` : "STAMP PATTERN"}
      </button>
    </div>
  );
};

export default PatternImport;
