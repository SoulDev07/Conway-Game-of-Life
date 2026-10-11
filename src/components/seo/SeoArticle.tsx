import styles from "@/app/page.module.css";
import { FAQS_DATA, RULES_DATA, SHORTCUTS_DATA } from "@/components/info/constants";

export function SeoArticle() {
  return (
    <article className={styles.seoArticle} aria-label="About Conway's Game of Life">
      <h2>What is Conway’s Game of Life?</h2>
      <p>
        Conway’s Game of Life is a zero-player cellular automaton created in 1970 by British
        mathematician John Horton Conway. The simulation unfolds on a two-dimensional grid of square
        cells, each of which is in one of two states: live or dead. Every cell interacts with its
        eight horizontal, vertical, and diagonal neighbours.
      </p>

      <h2>The Four Rules of Life (Conway&apos;s B3/S23)</h2>
      <p>
        At each discrete time step, the following transitions occur across the entire grid
        simultaneously:
      </p>
      <ol>
        {RULES_DATA.map((rule) => (
          <li key={rule.number}>
            <strong>
              {rule.title} ({rule.condition}):
            </strong>{" "}
            {rule.description}
          </li>
        ))}
      </ol>

      <h2>Mathematical Significance &amp; Turing Completeness</h2>
      <p>
        Despite having only four simple rules, the Game of Life is computationally universal (Turing
        complete). It can simulate logic gates, binary counters, memory registers, universal Turing
        machines, and even a simulation of the Game of Life inside itself.
      </p>

      <h2>Simulation Features &amp; Performance</h2>
      <p>
        This web application runs simulation ticks off the main thread inside dedicated Web Workers
        with flat typed arrays (Uint8Array and Uint16Array) and double-buffering. Key features
        include Run Length Encoded (RLE) pattern import and export, toroidal wrap border mode,
        preset patterns, CRT phosphor glow effects, box selection, and URL-based pattern sharing.
      </p>

      <h2>Keyboard &amp; Touch Controls</h2>
      <ul>
        {SHORTCUTS_DATA.map((item) => (
          <li key={item.action}>
            <strong>{item.action}</strong> ({item.shortcut}): {item.description}
          </li>
        ))}
      </ul>

      <h2>Frequently Asked Questions</h2>
      <dl>
        {FAQS_DATA.map((faq) => (
          <div key={faq.id}>
            <dt>
              <strong>{faq.question}</strong>
            </dt>
            <dd>{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

export default SeoArticle;
