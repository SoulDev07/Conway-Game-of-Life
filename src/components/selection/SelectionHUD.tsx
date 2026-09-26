"use client";

import { useState } from "react";
import { toast } from "sonner";
import { copyToClipboard, extractSelectionCells, generateRLE, getSelectionBounds } from "@/lib";
import type { GridSelection, SimulationGridState, Theme } from "@/types";
import styles from "./SelectionHUD.module.css";

export interface SelectionHUDProps {
  grid: SimulationGridState;
  selection: GridSelection;
  theme: Theme;
  onClearSelection: () => void;
  onOpenExportModal: () => void;
}

export const SelectionHUD = ({
  grid,
  selection,
  theme,
  onClearSelection,
  onOpenExportModal,
}: SelectionHUDProps) => {
  const [copied, setCopied] = useState(false);
  const bounds = getSelectionBounds(selection);
  const cells = extractSelectionCells(grid, selection);

  const handleCopyRle = async () => {
    if (cells.length === 0) {
      toast.error("Selection contains no live cells.");
      return;
    }
    const rle = generateRLE(cells, "Selection");
    const ok = await copyToClipboard(rle);
    if (ok) {
      setCopied(true);
      toast.success("RLE copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Failed to copy to clipboard.");
    }
  };

  return (
    <div
      className={styles.hud}
      role="status"
      aria-live="polite"
      style={{
        background: theme.bgSecondary,
        borderColor: theme.accentColor,
        color: theme.textPrimary,
      }}
    >
      <div className={styles.left}>
        <span className={styles.title} style={{ color: theme.accentColor }}>
          SELECTION: {bounds.width}×{bounds.height}
        </span>
        <span className={styles.meta} style={{ color: theme.textMuted }}>
          ({cells.length} live cell{cells.length === 1 ? "" : "s"})
        </span>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={handleCopyRle}
          disabled={cells.length === 0}
          style={{
            borderColor: theme.accentColor,
            color: copied ? theme.bgColor : theme.accentColor,
            background: copied ? theme.accentColor : "transparent",
            opacity: cells.length === 0 ? 0.4 : 1,
          }}
          aria-label="Copy RLE of selection to clipboard"
        >
          {copied ? "COPIED RLE!" : "COPY RLE"}
        </button>

        <button
          type="button"
          className={styles.btn}
          onClick={onOpenExportModal}
          disabled={cells.length === 0}
          style={{
            borderColor: theme.accentColor,
            color: theme.textPrimary,
            opacity: cells.length === 0 ? 0.4 : 1,
          }}
          aria-label="Open export and share dialog for selection"
        >
          EXPORT / SHARE
        </button>

        <button
          type="button"
          className={`${styles.btn} ${styles.cancelBtn}`}
          onClick={onClearSelection}
          style={{
            borderColor: theme.borderSubtle,
            color: theme.textMuted,
          }}
          aria-label="Clear selection"
        >
          DESELECT
        </button>
      </div>
    </div>
  );
};

export default SelectionHUD;
