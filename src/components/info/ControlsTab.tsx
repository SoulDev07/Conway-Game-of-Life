import type { Theme } from "@/types";
import { SHORTCUTS_DATA } from "./constants";
import styles from "./InfoModal.module.css";

export function ControlsTab({ theme }: { theme: Theme }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle} style={{ color: theme.accentColor }}>
        Controls &amp; Gestures
      </h3>
      <p className={styles.sectionLead}>
        Whether on a touchscreen smartphone, tablet, or desktop keyboard, you have full control over
        the universe.
      </p>

      {/* Touch & Handheld Gesture Quick Cards */}
      <div className={styles.mobileGestureCards}>
        <div className={styles.gestureCard} style={{ borderColor: theme.borderSubtle }}>
          <span
            className={styles.gestureBadge}
            style={{ color: theme.accentColor, borderColor: theme.accentColor }}
          >
            TOUCH
          </span>
          <div>
            <strong className={styles.gestureTitle} style={{ color: theme.textPrimary }}>
              Tap &amp; Drag
            </strong>
            <p className={styles.gestureText}>Draw living cells directly onto the canvas grid.</p>
          </div>
        </div>

        <div className={styles.gestureCard} style={{ borderColor: theme.borderSubtle }}>
          <span
            className={styles.gestureBadge}
            style={{ color: theme.accentColor, borderColor: theme.accentColor }}
          >
            CONTROLS
          </span>
          <div>
            <strong className={styles.gestureTitle} style={{ color: theme.textPrimary }}>
              Bottom Dock
            </strong>
            <p className={styles.gestureText}>
              Quickly Start, Step, Reset, Randomize, or open Patterns.
            </p>
          </div>
        </div>

        <div className={styles.gestureCard} style={{ borderColor: theme.borderSubtle }}>
          <span
            className={styles.gestureBadge}
            style={{ color: theme.accentColor, borderColor: theme.accentColor }}
          >
            MORE
          </span>
          <div>
            <strong className={styles.gestureTitle} style={{ color: theme.textPrimary }}>
              More Settings
            </strong>
            <p className={styles.gestureText}>
              Tap &apos;More&apos; to access Themes, Speed, CRT Glow, Wrap, and Box Select.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer} style={{ borderColor: theme.borderSubtle }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Action</th>
              <th scope="col">Key</th>
              <th scope="col" className={styles.gestureColHeader}>
                Touch / Gesture
              </th>
              <th scope="col">Description</th>
            </tr>
          </thead>
          <tbody>
            {SHORTCUTS_DATA.map((item) => (
              <tr key={item.action}>
                <td className={styles.actionName} style={{ color: theme.textPrimary }}>
                  {item.action}
                </td>
                <td>
                  <kbd style={{ color: theme.accentColor, borderColor: theme.borderSubtle }}>
                    {item.shortcut}
                  </kbd>
                </td>
                <td className={styles.gestureCell}>
                  {item.gesture ? (
                    <span
                      className={styles.gesturePill}
                      style={{ borderColor: theme.borderSubtle }}
                    >
                      {item.gesture}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className={styles.actionDesc}>{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
