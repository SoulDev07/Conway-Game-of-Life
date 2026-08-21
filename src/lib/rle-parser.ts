import type { CellCoordinate } from "@/types";

export class RLEParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RLEParseError";
  }
}

export interface RLEParseResult {
  grid: CellCoordinate[];
  name: string;
  description: string;
  width: number;
  height: number;
  rule: string;
}

export function parseRLE(src: string): RLEParseResult {
  const lines = src
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let name = "";
  const commentLines: string[] = [];
  let headerLine = "";
  const bodyLines: string[] = [];
  let headerFound = false;

  for (const line of lines) {
    if (headerFound) {
      bodyLines.push(line);
      continue;
    }
    if (line.startsWith("#N")) {
      name = line.slice(2).trim();
    } else if (line.startsWith("#C") || line.startsWith("#c")) {
      const comment = line.slice(2).trim();
      if (comment) commentLines.push(comment);
    } else if (line.startsWith("#")) {
      // Skip comments
    } else if (line.toLowerCase().startsWith("x")) {
      headerLine = line;
      headerFound = true;
    } else {
      bodyLines.push(line);
    }
  }

  let width = 0;
  let height = 0;
  let rule = "B3/S23";

  if (headerLine) {
    const xMatch = headerLine.match(/x\s*=\s*(\d+)/i);
    const yMatch = headerLine.match(/y\s*=\s*(\d+)/i);
    const ruleMatch = headerLine.match(/rule\s*=\s*([^\s,]+)/i);

    if (!xMatch || !yMatch) {
      throw new RLEParseError(`Malformed RLE header: "${headerLine}"`);
    }

    width = Number.parseInt(xMatch[1], 10);
    height = Number.parseInt(yMatch[1], 10);
    if (ruleMatch) {
      rule = ruleMatch[1];
    }
  }

  const body = bodyLines.join("").replace(/\s/g, "");
  const exclamation = body.indexOf("!");
  const rleData = exclamation >= 0 ? body.slice(0, exclamation) : body;

  const grid: CellCoordinate[] = [];
  let row = 0;
  let col = 0;
  let countStr = "";
  let maxCol = 0;

  for (const ch of rleData) {
    if (ch >= "0" && ch <= "9") {
      countStr += ch;
      if (countStr.length > 6) {
        throw new RLEParseError("Token count exceeds allowable limit.");
      }
    } else {
      const count = countStr === "" ? 1 : Number.parseInt(countStr, 10);
      countStr = "";

      if (count > 50000) {
        throw new RLEParseError("RLE dimension too large (exceeds 50,000).");
      }

      if (ch === "b") {
        col += count;
      } else if (ch === "o") {
        for (let i = 0; i < count; i++) {
          grid.push([row, col]);
          col++;
          if (grid.length > 100000) {
            throw new RLEParseError("Pattern exceeds maximum live cell limit (100,000 cells).");
          }
        }
      } else if (ch === "$") {
        row += count;
        col = 0;
      } else {
        throw new RLEParseError(`Unknown RLE token: "${ch}"`);
      }

      if (col > maxCol) {
        maxCol = col;
      }
    }
  }

  if (width === 0) width = maxCol;
  if (height === 0) height = row + 1;

  return {
    grid,
    name,
    description: commentLines.join(" "),
    width,
    height,
    rule,
  };
}

export function parsePlaintext(src: string): RLEParseResult {
  const lines = src
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let name = "";
  const commentLines: string[] = [];
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("!Name:")) {
      name = line.slice(6).trim();
    } else if (line.startsWith("!")) {
      const comment = line.slice(1).trim();
      if (comment) commentLines.push(comment);
    } else {
      dataLines.push(line);
    }
  }

  if (dataLines.length === 0) {
    throw new RLEParseError("No cell data found in plaintext pattern.");
  }

  const grid: CellCoordinate[] = [];
  let width = 0;

  for (let r = 0; r < dataLines.length; r++) {
    const row = dataLines[r];
    if (row.length > width) width = row.length;
    for (let c = 0; c < row.length; c++) {
      if (row[c] === "O" || row[c] === "*") {
        grid.push([r, c]);
      }
    }
  }

  return {
    grid,
    name,
    description: commentLines.join(" "),
    width,
    height: dataLines.length,
    rule: "B3/S23",
  };
}

export function parsePatternString(src: string): RLEParseResult {
  const trimmed = src.trim();
  if (trimmed.startsWith("!") || (trimmed.includes(".") && !trimmed.includes("="))) {
    return parsePlaintext(src);
  }
  return parseRLE(src);
}
