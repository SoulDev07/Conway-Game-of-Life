import { useEffect } from "react";

export interface ShortcutHandlers {
  onTogglePlay: () => void;
  onStep: () => void;
  onClear: () => void;
  onRandom: () => void;
  onToggleGlow: () => void;
  onTogglePatterns: () => void;
  onToggleSelect: () => void;
  onOpenExport: () => void;
  onCancel: () => void;
  onToggleInfo?: () => void;
  isRunning: boolean;
}

export const useKeyboardShortcuts = ({
  onTogglePlay,
  onStep,
  onClear,
  onRandom,
  onToggleGlow,
  onTogglePatterns,
  onToggleSelect,
  onOpenExport,
  onCancel,
  onToggleInfo,
  isRunning,
}: ShortcutHandlers) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      if (e.code === "Space") {
        e.preventDefault();
        onTogglePlay();
      } else if (key === "s") {
        if (!isRunning) onStep();
      } else if (key === "c") {
        onClear();
      } else if (key === "r") {
        onRandom();
      } else if (key === "g") {
        onToggleGlow();
      } else if (key === "p") {
        onTogglePatterns();
      } else if (key === "b") {
        onToggleSelect();
      } else if (key === "e") {
        onOpenExport();
      } else if (key === "?" || key === "h") {
        onToggleInfo?.();
      } else if (e.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    onTogglePlay,
    onStep,
    onClear,
    onRandom,
    onToggleGlow,
    onTogglePatterns,
    onToggleSelect,
    onOpenExport,
    onCancel,
    onToggleInfo,
    isRunning,
  ]);
};
