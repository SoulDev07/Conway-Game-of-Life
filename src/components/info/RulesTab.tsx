import type { Theme } from "@/types";
import { RULES_DATA } from "./constants";
import styles from "./InfoModal.module.css";

export function RulesTab({ theme }: { theme: Theme }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle} style={{ color: theme.accentColor }}>
        The 4 Rules of Life (Conway&apos;s B3/S23)
      </h3>
      <p className={styles.sectionLead}>
        The universe of the Game of Life is a two-dimensional grid of square cells. Every cell
        interacts with its 8 neighbours (horizontal, vertical, diagonal). In every step, all
        transitions happen simultaneously according to these 4 simple rules:
      </p>

      <div className={styles.ruleGrid}>
        {RULES_DATA.map((rule) => {
          const badgeClass =
            rule.type === "survival"
              ? styles.badgeSurvival
              : rule.type === "birth"
                ? styles.badgeBirth
                : styles.badgeDeath;

          return (
            <div
              key={rule.number}
              className={styles.ruleCard}
              style={{ borderColor: theme.borderSubtle }}
            >
              <div className={styles.ruleCardHeader}>
                <span className={styles.ruleCardTitle} style={{ color: theme.textPrimary }}>
                  {rule.number}. {rule.title}
                </span>
                <span className={`${styles.ruleBadge} ${badgeClass}`}>{rule.type}</span>
              </div>
              <div className={styles.ruleCondition} style={{ color: theme.accentColor }}>
                {rule.condition}
              </div>
              <p className={styles.ruleCardDesc}>{rule.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
