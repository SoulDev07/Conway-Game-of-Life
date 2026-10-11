import type { Theme } from "@/types";
import styles from "./InfoModal.module.css";

export function AboutTab({ theme }: { theme: Theme }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle} style={{ color: theme.accentColor }}>
        Origin &amp; Mathematical Significance
      </h3>

      <div className={styles.aboutCard} style={{ borderColor: theme.borderSubtle }}>
        <p>
          Conway&apos;s Game of Life was created in 1970 by British mathematician{" "}
          <strong style={{ color: theme.accentColor }}>John Horton Conway</strong>. It was
          introduced to the world in Martin Gardner&apos;s famous “Mathematical Games” column in{" "}
          <em>Scientific American</em>, immediately capturing the imagination of mathematicians and
          computer scientists worldwide.
        </p>

        <p>
          Life is the foremost example of a <strong>zero-player game</strong> and{" "}
          <strong>emergence</strong>: how intricate, self-organizing structures (gliders,
          oscillators, logic circuits) naturally arise out of a tiny set of purely deterministic,
          local rules.
        </p>

        <p>
          Remarkably, Conway&apos;s Game of Life is <strong>Turing complete</strong>. It is capable
          of performing any calculation that any supercomputer can perform, simulating logic gates,
          registers, universal Turing machines, and even a complete simulation of the Game of Life
          running inside itself!
        </p>
      </div>
    </div>
  );
}
