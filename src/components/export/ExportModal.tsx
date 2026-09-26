"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  buildShareUrl,
  copyToClipboard,
  downloadFile,
  generatePlaintext,
  generateRLE,
  getCoordinatesBounds,
} from "@/lib";
import type { CellCoordinate, Theme, ThemeKey } from "@/types";
import styles from "./ExportModal.module.css";

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  themeKey: ThemeKey;
  cells: CellCoordinate[];
  defaultName: string;
}

export const ExportModal = ({
  isOpen,
  onClose,
  theme,
  themeKey,
  cells,
  defaultName,
}: ExportModalProps) => {
  const [patternName, setPatternName] = useState(defaultName);
  const [copiedRle, setCopiedRle] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPatternName(defaultName);
      setCopiedRle(false);
      setCopiedUrl(false);
    }
  }, [isOpen, defaultName]);

  const bounds = useMemo(() => getCoordinatesBounds(cells), [cells]);

  const rleString = useMemo(() => {
    return generateRLE(cells, patternName.trim() || "Pattern");
  }, [cells, patternName]);

  const plaintextString = useMemo(() => {
    return generatePlaintext(cells, patternName.trim() || "Pattern");
  }, [cells, patternName]);

  const shareUrl = useMemo(() => {
    return buildShareUrl(rleString, themeKey);
  }, [rleString, themeKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || cells.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { minR, minC, width: pCols, height: pRows } = bounds;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const padding = 6;
    const availableW = width - padding * 2;
    const availableH = height - padding * 2;

    const cellSize = Math.max(
      2,
      Math.min(10, Math.floor(Math.min(availableW / pCols, availableH / pRows))),
    );

    const drawW = pCols * cellSize;
    const drawH = pRows * cellSize;
    const startX = Math.floor((width - drawW) / 2);
    const startY = Math.floor((height - drawH) / 2);

    ctx.fillStyle = theme.cellColor;
    for (const [r, c] of cells) {
      const x = startX + (c - minC) * cellSize;
      const y = startY + (r - minR) * cellSize;
      ctx.fillRect(x, y, Math.max(1, cellSize - 1), Math.max(1, cellSize - 1));
    }
  }, [cells, bounds, theme.cellColor]);

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

  const sanitizeFilename = (name: string) => {
    return (
      name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "_") || "pattern"
    );
  };

  const handleCopyRle = async () => {
    const ok = await copyToClipboard(rleString);
    if (ok) {
      setCopiedRle(true);
      toast.success("RLE snippet copied to clipboard!");
      setTimeout(() => setCopiedRle(false), 2000);
    } else {
      toast.error("Failed to copy to clipboard.");
    }
  };

  const handleDownloadRle = () => {
    const filename = `${sanitizeFilename(patternName)}.rle`;
    downloadFile(rleString, filename, "text/plain");
    toast.success(`Downloaded ${filename}`);
  };

  const handleDownloadCells = () => {
    const filename = `${sanitizeFilename(patternName)}.cells`;
    downloadFile(plaintextString, filename, "text/plain");
    toast.success(`Downloaded ${filename}`);
  };

  const handleCopyShareUrl = async () => {
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setCopiedUrl(true);
      toast.success("Shareable URL copied to clipboard!");
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      toast.error("Failed to copy to clipboard.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.bgSecondary,
          borderColor: theme.accentColor,
          color: theme.textPrimary,
        }}
      >
        <div className={styles.header}>
          <h2 id="export-modal-title" className={styles.title} style={{ color: theme.accentColor }}>
            EXPORT & SHARE PATTERN
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            style={{ color: theme.textMuted }}
            aria-label="Close export dialog"
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.previewSection}>
            <div className={styles.canvasWrap} style={{ borderColor: theme.borderSubtle }}>
              <canvas
                ref={canvasRef}
                width={88}
                height={88}
                className={styles.previewCanvas}
                aria-label="Pattern thumbnail"
              />
            </div>
            <div className={styles.metaWrap}>
              <label
                htmlFor="pattern-name-input"
                style={{ fontSize: "0.8rem", color: theme.textMuted }}
              >
                PATTERN NAME:
              </label>
              <input
                id="pattern-name-input"
                type="text"
                className={styles.nameInput}
                value={patternName}
                onChange={(e) => setPatternName(e.target.value)}
                style={{
                  borderColor: theme.borderSubtle,
                  color: theme.textPrimary,
                }}
                maxLength={40}
              />
              <div className={styles.statsRow}>
                <span className={styles.statItem} style={{ color: theme.textMuted }}>
                  SIZE:{" "}
                  <strong style={{ color: theme.textPrimary }}>
                    {bounds.width}×{bounds.height}
                  </strong>
                </span>
                <span className={styles.statItem} style={{ color: theme.textMuted }}>
                  CELLS: <strong style={{ color: theme.accentColor }}>{cells.length}</strong>
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className={styles.sectionTitle} style={{ color: theme.textMuted }}>
              RLE Snippet:
            </div>
            <textarea
              className={styles.codeArea}
              value={rleString}
              readOnly
              aria-label="Generated RLE code snippet"
              style={{
                background: "rgba(0,0,0,0.3)",
                borderColor: theme.borderSubtle,
                color: theme.textPrimary,
              }}
            />
          </div>

          <div className={styles.buttonGrid}>
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              onClick={handleCopyRle}
              style={{
                borderColor: theme.accentColor,
                color: copiedRle ? theme.bgColor : theme.accentColor,
                background: copiedRle ? theme.accentColor : "rgba(255,255,255,0.06)",
              }}
              aria-label="Copy RLE snippet directly to clipboard"
            >
              {copiedRle ? "COPIED TO CLIPBOARD!" : "COPY RLE SNIPPET"}
            </button>

            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleDownloadRle}
              style={{
                borderColor: theme.borderSubtle,
                color: theme.textPrimary,
              }}
              aria-label="Download .rle pattern file"
            >
              DOWNLOAD .RLE
            </button>

            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleDownloadCells}
              style={{
                borderColor: theme.borderSubtle,
                color: theme.textPrimary,
              }}
              aria-label="Download .cells plaintext pattern file"
            >
              DOWNLOAD .CELLS
            </button>
          </div>

          <div className={styles.shareSection}>
            <div className={styles.sectionTitle} style={{ color: theme.textMuted }}>
              Shareable URL (?rle=...&amp;theme=...):
            </div>
            <div className={styles.shareUrlRow}>
              <input
                type="text"
                className={styles.shareUrlInput}
                value={shareUrl}
                readOnly
                aria-label="Shareable URL"
                style={{
                  borderColor: theme.borderSubtle,
                  color: theme.textPrimary,
                }}
              />
              <button
                type="button"
                className={styles.actionBtn}
                onClick={handleCopyShareUrl}
                style={{
                  borderColor: theme.accentColor,
                  color: copiedUrl ? theme.bgColor : theme.accentColor,
                  background: copiedUrl ? theme.accentColor : "transparent",
                }}
                aria-label="Copy shareable link"
              >
                {copiedUrl ? "COPIED!" : "COPY LINK"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
