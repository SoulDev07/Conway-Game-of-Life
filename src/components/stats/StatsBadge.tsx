"use client";

import type React from "react";
import type { Theme } from "@/types";
import styles from "./StatsBadge.module.css";

interface StatsBadgeProps {
  generation: number;
  aliveCount: number;
  theme: Theme;
}

export const StatsBadge: React.FC<StatsBadgeProps> = ({ generation, aliveCount, theme }) => {
  return (
    <div
      className={styles.container}
      style={{
        background: theme.bgSecondary,
        borderColor: theme.borderSubtle,
      }}
    >
      <div className={styles.item}>
        <span className={styles.label} style={{ color: theme.textMuted }}>
          GEN:
        </span>
        <span className={styles.value} style={{ color: theme.textPrimary }}>
          {generation}
        </span>
      </div>

      <div className={styles.divider} style={{ background: theme.borderSubtle }} />

      <div className={styles.item}>
        <span className={styles.label} style={{ color: theme.textMuted }}>
          ALIVE:
        </span>
        <span className={styles.value} style={{ color: theme.accentColor }}>
          {aliveCount}
        </span>
      </div>
    </div>
  );
};

export default StatsBadge;
