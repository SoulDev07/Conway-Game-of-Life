import { useId, useState } from "react";
import type { Theme } from "@/types";
import { FAQS_DATA } from "./constants";
import styles from "./InfoModal.module.css";

export function FaqTab({ theme }: { theme: Theme }) {
  const [expandedIds, setExpandedIds] = useState(() => new Set(["what-is-life", "what-is-b3s23"]));
  const baseId = useId();

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle} style={{ color: theme.accentColor }}>
        Frequently Asked Questions
      </h3>

      <div className={styles.faqList}>
        {FAQS_DATA.map((faq) => {
          const isExpanded = expandedIds.has(faq.id);
          const answerId = `${baseId}-faq-answer-${faq.id}`;

          return (
            <div
              key={faq.id}
              className={`${styles.faqCard} ${isExpanded ? styles.faqCardExpanded : ""}`}
              style={{
                borderColor: isExpanded ? theme.accentColor : theme.borderSubtle,
              }}
            >
              <button
                type="button"
                className={styles.faqHeader}
                onClick={() => toggleExpand(faq.id)}
                aria-expanded={isExpanded}
                aria-controls={answerId}
              >
                <span className={styles.faqQuestion} style={{ color: theme.textPrimary }}>
                  {faq.question}
                </span>
                <span
                  className={`${styles.faqToggleIcon} ${isExpanded ? styles.faqToggleIconExpanded : ""}`}
                  style={{
                    color: isExpanded ? theme.bgSecondary : theme.accentColor,
                    backgroundColor: isExpanded ? theme.accentColor : "rgba(255, 255, 255, 0.05)",
                    borderColor: theme.accentColor,
                  }}
                  aria-hidden="true"
                >
                  <svg
                    className={styles.plusMinusSvg}
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    width="12"
                    height="12"
                  >
                    <title>{isExpanded ? "Collapse question" : "Expand question"}</title>
                    {/* Horizontal bar */}
                    <rect x="2" y="7" width="12" height="2" rx="1" />
                    {/* Vertical bar (hidden via CSS when expanded) */}
                    <rect x="7" y="2" width="2" height="12" rx="1" className={styles.verticalBar} />
                  </svg>
                </span>
              </button>

              {isExpanded && (
                <div id={answerId} className={styles.faqAnswer}>
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
