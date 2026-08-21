import type { GameBoardState } from "./game";
import type { PresetPattern } from "./pattern";

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
  | { type: "resize"; rows: number; cols: number };

export type WorkerOutMessage = {
  type: "tick";
  board: GameBoardState;
};
