import type { FaqItem, RuleCardData, ShortcutItemData } from "./types";

export const RULES_DATA: RuleCardData[] = [
  {
    number: "1",
    title: "Underpopulation",
    condition: "< 2 live neighbours",
    description:
      "Any live cell with fewer than two live neighbours dies, as if by underpopulation.",
    type: "death",
  },
  {
    number: "2",
    title: "Survival",
    condition: "2 or 3 live neighbours",
    description: "Any live cell with two or three live neighbours survives to the next generation.",
    type: "survival",
  },
  {
    number: "3",
    title: "Overpopulation",
    condition: "> 3 live neighbours",
    description: "Any live cell with more than three live neighbours dies, as if by overcrowding.",
    type: "death",
  },
  {
    number: "4",
    title: "Reproduction",
    condition: "Exactly 3 live neighbours",
    description:
      "Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.",
    type: "birth",
  },
];

export const SHORTCUTS_DATA: ShortcutItemData[] = [
  {
    action: "Draw / Toggle Cell",
    shortcut: "Click / Drag",
    gesture: "Tap or drag finger on grid",
    description: "Draw alive cells or toggle cell state directly on the board.",
  },
  {
    action: "Play / Pause",
    shortcut: "Space",
    gesture: "Tap 'Start' / 'Stop' button",
    description: "Start or pause continuous automatic simulation ticks.",
  },
  {
    action: "Step Forward",
    shortcut: "S",
    gesture: "Tap 'Step' button",
    description: "Advance the grid forward by exactly one generation.",
  },
  {
    action: "Randomize",
    shortcut: "R",
    gesture: "Tap 'Random' button",
    description: "Scatter random live cells across the current grid.",
  },
  {
    action: "Reset / Clear",
    shortcut: "C",
    gesture: "Tap 'Reset' button",
    description: "Clear all alive cells and reset generation count.",
  },
  {
    action: "Pattern Library",
    shortcut: "P",
    gesture: "Tap 'Patterns' button",
    description: "Open the preset picker (Guns, Oscillators, Spaceships) to stamp.",
  },
  {
    action: "Box Select Region",
    shortcut: "B",
    gesture: "Tap 'More' > 'Box Select' & drag",
    description: "Isolate, inspect, or export a selected rectangular region.",
  },
  {
    action: "Export & Share",
    shortcut: "E",
    gesture: "Selection HUD > 'Export'",
    description: "Open export modal to generate RLE code or shareable URLs.",
  },
  {
    action: "Settings & Options",
    shortcut: "G (Glow)",
    gesture: "Tap 'More' button",
    description: "Toggle CRT Glow, Wrap mode, change color theme or simulation speed.",
  },
  {
    action: "Guide & FAQ",
    shortcut: "? / H",
    gesture: "Tap top-right 'GUIDE [?]'",
    description: "Open this interactive guide, rules, gestures, and FAQ dialog.",
  },
  {
    action: "Cancel / Close",
    shortcut: "Esc",
    gesture: "Tap '✕' or outside dialog",
    description: "Cancel active stamp/selection or close open modals.",
  },
];

export const FAQS_DATA: FaqItem[] = [
  {
    id: "what-is-life",
    question: "What is Conway's Game of Life?",
    answer:
      "Conway's Game of Life is a zero-player cellular automaton created by British mathematician John Horton Conway in 1970. It takes place on a two-dimensional grid of square cells, where each cell is either alive or dead. The evolution of the universe is completely determined by its starting configuration, with no further human intervention required.",
    category: "Basics",
  },
  {
    id: "what-is-b3s23",
    question: "What does the 'B3/S23' rule notation mean?",
    answer:
      "B3/S23 is the standard cellular automaton notation for Conway's Life. 'B3' (Birth 3) means a dead cell becomes alive if it has exactly 3 living neighbours. 'S23' (Survival 2, 3) means a living cell stays alive if it has 2 or 3 living neighbours. Under all other neighbour counts, live cells die and dead cells remain dead.",
    category: "Basics",
  },
  {
    id: "is-it-turing-complete",
    question: "Is Conway's Game of Life Turing complete?",
    answer:
      "Yes. The Game of Life is computationally universal. By using gliders to transmit data streams and glider guns as clocks, mathematicians and computer scientists have built logic gates (AND, OR, NOT), memory registers, counters, and even a fully functional 8-bit programmable microprocessor entirely inside the Game of Life.",
    category: "Advanced",
  },
  {
    id: "toroidal-wrap-mode",
    question: "What is 'Wrap' (Toroidal Grid) mode?",
    answer:
      "When Wrap mode is enabled, the edges of the grid connect seamlessly: cells moving off the right edge reappear on the left, and cells traveling past the bottom emerge at the top. Topologically, this turns the flat rectangular grid into a torus (doughnut surface), preventing gliders and spaceships from getting lost off-screen.",
    category: "Simulation",
  },
  {
    id: "performance-web-workers",
    question: "How does this simulation achieve smooth 60 FPS performance?",
    answer:
      "All cellular generation computations run off the main browser thread inside a dedicated Web Worker. The engine uses contiguous typed arrays (Uint8Array and Uint16Array) with double-buffering, avoiding garbage collection pauses and ensuring high framerates even on large grids and mobile devices.",
    category: "Simulation",
  },
  {
    id: "what-is-rle-format",
    question: "What is RLE format and how do I import/export patterns?",
    answer:
      "Run Length Encoded (RLE) is the standard file format created for cellular automaton simulators like Golly and Life32. It compactly encodes dead ('b') and alive ('o') cell runs with numeric counts. You can paste any external RLE pattern into the 'Import' tab or use the 'Export' modal to copy your own designs as RLE code.",
    category: "Sharing",
  },
  {
    id: "infinite-growth",
    question: "Can patterns grow or travel forever?",
    answer:
      "Yes! While some patterns quickly die or stabilize into static 'Still Lifes', spaceships like the Glider travel indefinitely across toroidal space, oscillators cycle through repeating states forever, and pattern generators like the Gosper Glider Gun produce an unending stream of new cells.",
    category: "Advanced",
  },
];
