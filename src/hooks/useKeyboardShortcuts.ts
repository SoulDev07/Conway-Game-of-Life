import { useEffect } from "react";

export interface ShortcutHandlers {
  onTogglePlay: () => void;
  onStep: () => void;
  onClear: () => void;
  onRandom: () => void;
  onToggleGlow: () => void;
  onTogglePatterns: () => void;
  onCancel: () => void;
  isRunning: boolean;
}

export function useKeyboardShortcuts({
  onTogglePlay,
  onStep,
  onClear,
  onRandom,
  onToggleGlow,
  onTogglePatterns,
  onCancel,
  isRunning,
}: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        onTogglePlay();
      } else if (e.key === "s" || e.key === "S") {
        if (!isRunning) onStep();
      } else if (e.key === "c" || e.key === "C") {
        onClear();
      } else if (e.key === "r" || e.key === "R") {
        onRandom();
      } else if (e.key === "g" || e.key === "G") {
        onToggleGlow();
      } else if (e.key === "p" || e.key === "P") {
        onTogglePatterns();
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
    onCancel,
    isRunning,
  ]);
}
