"use client";

import { useCallback, useEffect, useState } from "react";
import type { Theme } from "@/types";
import { AboutTab } from "./AboutTab";
import { ControlsTab } from "./ControlsTab";
import { FaqTab } from "./FaqTab";
import styles from "./InfoModal.module.css";
import { RulesTab } from "./RulesTab";
import type { TabKey } from "./types";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: "rules", label: "RULES (B3/S23)" },
  { key: "controls", label: "CONTROLS" },
  { key: "history", label: "ABOUT LIFE" },
  { key: "faq", label: "FAQ" },
];

export function InfoModal({ isOpen, onClose, theme }: InfoModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("rules");

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
    >
      <div
        className={styles.modal}
        style={{
          background: theme.bgSecondary,
          borderColor: theme.accentColor,
          color: theme.textPrimary,
        }}
      >
        <header className={styles.header} style={{ borderColor: theme.borderSubtle }}>
          <h2 id="info-modal-title" className={styles.title} style={{ color: theme.accentColor }}>
            CONWAY’S GAME OF LIFE • GUIDE
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close guide dialog"
            style={{
              borderColor: theme.borderSubtle,
              color: theme.textPrimary,
            }}
          >
            ✕
          </button>
        </header>

        <div className={styles.tabs} role="tablist" style={{ borderColor: theme.borderSubtle }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`${styles.tabBtn} ${activeTab === tab.key ? styles.activeTabBtn : ""}`}
              onClick={() => setActiveTab(tab.key)}
              style={{
                color: activeTab === tab.key ? theme.accentColor : theme.textPrimary,
                borderColor: activeTab === tab.key ? theme.accentColor : "transparent",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.body}>
          {activeTab === "rules" && <RulesTab theme={theme} />}
          {activeTab === "controls" && <ControlsTab theme={theme} />}
          {activeTab === "history" && <AboutTab theme={theme} />}
          {activeTab === "faq" && <FaqTab theme={theme} />}
        </div>

        <footer className={styles.footer} style={{ borderColor: theme.borderSubtle }}>
          <span className={styles.footerHintDesktop}>PRESS [ESC] TO CLOSE • [?] FOR GUIDE</span>
          <span className={styles.footerHintMobile}>TAP OUTSIDE OR ✕ TO CLOSE</span>
          <a
            href="https://github.com/SoulDev07/Conway-Game-of-Life"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
            style={{ color: theme.accentColor }}
          >
            <span className={styles.githubIcon} aria-hidden="true" />
            <span>GITHUB REPO ↗</span>
          </a>
        </footer>
      </div>
    </div>
  );
}

export default InfoModal;
