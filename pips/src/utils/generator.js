// Helper to check if a cell is valid
const isValidPos = (r, c, rows, cols, shape) => {
  if (r < 0 || c < 0 || r >= rows || c >= cols) return false;
  if (shape && !shape[r][c]) return false;
  return true;
};

// Generate a random shape board
export const generatePuzzle = (difficulty) => {
  let rows = 4;
  let cols = 4;
  let complexity = 1; // Used for region splitting

  if (difficulty === "medium") {
    rows = 5;
    cols = 6;
    complexity = 2;
  } else if (difficulty === "hard") {
    rows = 6;
    cols = 7;
    complexity = 3;
  }

  // 1. Create a shape (simply a rectangle for now, or remove some corners for flavor)
  const gridShape = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(true));

  // Mask out some corners to make it interesting
  if (difficulty !== "easy") {
    gridShape[0][0] = false;
    gridShape[0][cols - 1] = false;
    if (difficulty === "hard") {
      gridShape[rows - 1][0] = false;
      gridShape[rows - 1][cols - 1] = false;
    }
  }

  // 2. Fill with dominoes (Backtracking or Randomized placement) to ensure solvability
  const solutionPlacement = [];
  const occupied = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(false));
  const dominoes = [];
  let dominoIdCounter = 1;

  const cellsToFill = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (gridShape[r][c]) cellsToFill.push({ r, c });
    }
  }

  // Shuffle cells to randomize start points
  cellsToFill.sort(() => Math.random() - 0.5);

  for (const cell of cellsToFill) {
    if (occupied[cell.r][cell.c]) continue;

    const neighbors = [
      { r: cell.r, c: cell.c + 1, rot: 0 }, // Right (Horizontal)
      { r: cell.r + 1, c: cell.c, rot: 90 }, // Down (Vertical)
    ].filter(
      (n) => isValidPos(n.r, n.c, rows, cols, gridShape) && !occupied[n.r][n.c]
    );

    if (neighbors.length > 0) {
      const target = neighbors[Math.floor(Math.random() * neighbors.length)];
      const v1 = Math.floor(Math.random() * 7); // 0-6
      const v2 = Math.floor(Math.random() * 7); // 0-6

      occupied[cell.r][cell.c] = true;
      occupied[target.r][target.c] = true;

      const dom = {
        id: `d-${dominoIdCounter++}`,
        v1,
        v2,
        rotation: 0, // Default in tray
      };
      dominoes.push(dom);

      solutionPlacement.push({
        r: cell.r,
        c: cell.c,
        v1,
        v2,
        rotation: target.rot,
      });
    }
  }

  const totalShapeCells = gridShape.flat().filter(Boolean).length;
  const filledCells = occupied.flat().filter(Boolean).length;

  if (filledCells !== totalShapeCells) {
    return generatePuzzle(difficulty);
  }

  // 3. Create Regions
  const valueGrid = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(-1));
  solutionPlacement.forEach((p) => {
    valueGrid[p.r][p.c] = p.v1;
    if (p.rotation === 0) {
      valueGrid[p.r][p.c + 1] = p.v2;
    } else {
      valueGrid[p.r + 1][p.c] = p.v2;
    }
  });

  const regions = [];
  const regionMap = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(-1)); // Stores regionID per cell
  let regionIdCounter = 0;

  const palette = ["pink", "purple", "teal", "orange", "navy"];

  const validCells = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (gridShape[r][c]) validCells.push({ r, c });

  validCells.sort(() => Math.random() - 0.5);

  validCells.forEach((cell) => {
    if (regionMap[cell.r][cell.c] !== -1) return;

    // Start a new region
    const regionId = regionIdCounter++;
    const regionCells = [cell];
    regionMap[cell.r][cell.c] = regionId;

    const targetSize = Math.floor(Math.random() * 3) + 2 + complexity;

    let attempts = 0;
    while (regionCells.length < targetSize && attempts < 10) {
      const base = regionCells[Math.floor(Math.random() * regionCells.length)];
      const nb = [
        { r: base.r + 1, c: base.c },
        { r: base.r - 1, c: base.c },
        { r: base.r, c: base.c + 1 },
        { r: base.r, c: base.c - 1 },
      ];
      const validNb = nb.filter(
        (n) =>
          isValidPos(n.r, n.c, rows, cols, gridShape) &&
          regionMap[n.r][n.c] === -1
      );

      if (validNb.length > 0) {
        const pick = validNb[Math.floor(Math.random() * validNb.length)];
        regionMap[pick.r][pick.c] = regionId;
        regionCells.push(pick);
      } else {
        attempts++;
      }
    }

    // --- COLORING LOGIC (No touching neighbors of same color) ---
    const neighborColors = new Set();

    regionCells.forEach((rc) => {
      const neighbors = [
        { r: rc.r + 1, c: rc.c },
        { r: rc.r - 1, c: rc.c },
        { r: rc.r, c: rc.c + 1 },
        { r: rc.r, c: rc.c - 1 },
      ];

      neighbors.forEach((n) => {
        if (isValidPos(n.r, n.c, rows, cols, gridShape)) {
          const neighborId = regionMap[n.r][n.c];
          // If neighbor exists and is not the current region we are building
          if (neighborId !== -1 && neighborId !== regionId) {
            // Find the color of that region
            const neighborRegion = regions.find(
              (reg) => reg._internalId === neighborId
            );
            if (neighborRegion) {
              neighborColors.add(neighborRegion.colorTheme);
            }
          }
        }
      });
    });

    // Filter palette for unused colors
    const availableColors = palette.filter((c) => !neighborColors.has(c));
    // If we run out of colors (rare on small board), fallback to full palette
    const finalPalette = availableColors.length > 0 ? availableColors : palette;
    const chosenColor =
      finalPalette[Math.floor(Math.random() * finalPalette.length)];

    // --- CONSTRAINT LOGIC ---
    const values = regionCells.map((c) => valueGrid[c.r][c.c]);
    const possibleConstraints = [{ type: "none" }];
    const sum = values.reduce((a, b) => a + b, 0);
    possibleConstraints.push({ type: "sum", value: sum });

    // Equality Checks: Only valid if more than 1 cell
    if (regionCells.length > 1) {
      if (values.every((v) => v === values[0])) {
        possibleConstraints.push({ type: "eq" });
      }
      const unique = new Set(values);
      if (unique.size === values.length) {
        possibleConstraints.push({ type: "neq" });
      }
    }

    // Greater/Less
    const diff = Math.floor(Math.random() * 3) + 1;
    possibleConstraints.push({ type: "gt", value: sum - diff });
    possibleConstraints.push({ type: "lt", value: sum + diff });

    const validConstraints = possibleConstraints.filter((c) => {
      if (c.type === "gt" && c.value < 0) return false;
      return true;
    });

    let chosenConstraint = validConstraints[0];
    if (validConstraints.length > 1) {
      const interesting = validConstraints.filter((c) => c.type !== "none");
      chosenConstraint =
        interesting[Math.floor(Math.random() * interesting.length)];
    }

    regionCells.sort((a, b) => a.r + a.c - (b.r + b.c));
    const labelPos = regionCells[regionCells.length - 1];

    regions.push({
      id: `region-${regionId}`,
      _internalId: regionId, // Used for coloring lookup
      colorTheme: chosenColor,
      cells: regionCells,
      constraint: chosenConstraint,
      labelPosition: labelPos,
    });
  });

  return {
    rows,
    cols,
    gridShape,
    regions,
    initialDominoes: dominoes,
  };
};

export const checkCompletion = (board, placements) => {
  const totalCells = board.gridShape.flat().filter(Boolean).length;
  if (placements.length * 2 !== totalCells) return false;

  const valueGrid = Array(board.rows)
    .fill(null)
    .map(() => Array(board.cols).fill(-1));

  for (const p of placements) {
    const dom = board.initialDominoes.find((d) => d.id === p.dominoId);
    if (!dom) return false;

    const rot = ((p.rotation % 360) + 360) % 360;

    const c1 = { r: p.r, c: p.c, v: dom.v1 };
    let c2 = { r: p.r, c: p.c, v: dom.v2 };

    if (rot === 0) c2 = { r: p.r, c: p.c + 1, v: dom.v2 };
    if (rot === 90) c2 = { r: p.r + 1, c: p.c, v: dom.v2 };
    if (rot === 180) c2 = { r: p.r, c: p.c - 1, v: dom.v2 };
    if (rot === 270) c2 = { r: p.r - 1, c: p.c, v: dom.v2 };

    const cells = [c1, c2];

    for (const cell of cells) {
      if (!isValidPos(cell.r, cell.c, board.rows, board.cols, board.gridShape))
        return false;
      if (valueGrid[cell.r][cell.c] !== -1) return false;
      valueGrid[cell.r][cell.c] = cell.v;
    }
  }

  for (const region of board.regions) {
    const values = region.cells.map((c) => valueGrid[c.r][c.c]);
    if (values.includes(-1)) return false;

    const sum = values.reduce((a, b) => a + b, 0);

    switch (region.constraint.type) {
      case "eq":
        if (!values.every((v) => v === values[0])) return false;
        break;
      case "neq":
        if (new Set(values).size !== values.length) return false;
        break;
      case "sum":
        if (sum !== region.constraint.value) return false;
        break;
      case "gt":
        if (sum <= region.constraint.value) return false;
        break;
      case "lt":
        if (sum >= region.constraint.value) return false;
        break;
      case "none":
      default:
        break;
    }
  }

  return true;
};
