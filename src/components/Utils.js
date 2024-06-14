// Constants for the board
const PATTERNS = [
  [[1, 0], [1, 1], [1, 2]],          // Blinker
  [[0, 1], [1, 1], [2, 1]],          // Glider
  [[0, 0], [0, 1], [1, 0], [1, 1]],  // Block
  [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]],  // L-Shape
  [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]],  // T-Shape
  [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],  // Line
  [[0, 0], [0, 1], [1, 1], [2, 1], [2, 0]],  // Glider Gun
];

const NEIGHBOR_OFFSETS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

// Function to generate an empty board
const generateEmptyBoard = (numRows, numCols) => Array(numRows * numCols).fill(false);

// Function to count the number of alive neighbors for a given cell
const countNeighbors = (prevBoard, numRows, numCols, i, j) => {
  let count = 0;

  NEIGHBOR_OFFSETS.forEach(([offsetI, offsetJ]) => {
    const neighRow = (i + offsetI + numRows) % numRows;
    const neighCol = (j + offsetJ + numCols) % numCols;
    if (prevBoard[neighRow * numCols + neighCol])
      count++;
  });

  return count;
};

// Function to update the state of a cell based on its neighbors
const updateCell = (prevBoard, numRows, numCols, rowIndex, colIndex) => {
  const index = (rowIndex * numCols + colIndex);
  const neighbours = countNeighbors(prevBoard, numRows, numCols, rowIndex, colIndex);
  const isAlive = prevBoard[index];
  return isAlive ? (neighbours === 2 || neighbours === 3) : neighbours === 3;
};

// Function to get a Random Pattern
const getRandomPattern = () => PATTERNS[Math.floor(Math.random() * PATTERNS.length)];

// Function to get the size of a pattern
const getPatternSize = (pattern) => {
  let maxRow = 0, maxCol = 0;

  pattern.forEach(([offsetI, offsetJ]) => {
    maxRow = Math.max(maxRow, offsetI);
    maxCol = Math.max(maxCol, offsetJ);
  });

  return { rows: maxRow + 1, cols: maxCol + 1 };
};

// Function to get valid starting position for a Pattern on a particular edge 
const calculateStartingPosition = (numRows, numCols, pattern, edge) => {
  const { rows, cols } = getPatternSize(pattern);

  switch (edge) {
    case 0: // Top edge
      return [0, Math.floor(Math.random() * (numCols - cols + 1))];

    case 1: // Bottom edge
      return [numRows - rows, Math.floor(Math.random() * (numCols - cols + 1))];

    case 2: // Left edge
      return [Math.floor(Math.random() * (numRows - rows + 1)), 0];

    case 3: // Right edge
      return [Math.floor(Math.random() * (numRows - rows + 1)), numCols - cols];
  }

  return [0, 0];
};

export { PATTERNS, generateEmptyBoard, updateCell, getRandomPattern, calculateStartingPosition };
