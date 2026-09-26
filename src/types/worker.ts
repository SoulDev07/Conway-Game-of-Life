import type { PresetPattern } from "./pattern";
import type { SimulationGridState } from "./simulation";

export type WorkerInMessage =
  | { type: "init"; rows: number; cols: number; speed: number }
  | { type: "start" }
  | { type: "stop" }
  | { type: "step" }
  | { type: "setSpeed"; speed: number }
  | { type: "setIdle"; idle: boolean }
  | { type: "clear" }
  | { type: "randomize"; density: number }
  | { type: "toggleCell"; row: number; col: number; targetState: boolean }
  | { type: "stamp"; pattern: PresetPattern; row: number; col: number }
  | { type: "loadPattern"; pattern: PresetPattern }
  | { type: "setGrid"; grid: SimulationGridState }
  | { type: "resize"; rows: number; cols: number }
  | { type: "setRule"; ruleId: string }
  | { type: "setWrapEdges"; wrap: boolean };

export type WorkerOutMessage = {
  type: "tick";
  grid: SimulationGridState;
};
