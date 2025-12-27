const isValidPos = (r, c, rows, cols, shape) => {
  if (r < 0 || c < 0 || r >= rows || c >= cols) return false;
  if (shape && !shape[r][c]) return false;
  return true;
};

const canPlaceDomino = (r, c, isVertical, rows, cols, gridShape) => {
  const r1 = r,
    c1 = c;
  const r2 = isVertical ? r + 1 : r;
  const c2 = isVertical ? c : c + 1;
  if (r1 < 0 || c1 < 0 || r1 >= rows || c1 >= cols) return false;
  if (r2 < 0 || c2 < 0 || r2 >= rows || c2 >= cols) return false;
  if (gridShape[r1][c1] || gridShape[r2][c2]) return false;
  return true;
};

const isTouchingExisting = (r, c, isVertical, rows, cols, gridShape) => {
  const cells = [
    { r, c },
    { r: isVertical ? r + 1 : r, c: isVertical ? c : c + 1 },
  ];
  for (const cell of cells) {
    const neighbors = [
      { r: cell.r + 1, c: cell.c },
      { r: cell.r - 1, c: cell.c },
      { r: cell.r, c: cell.c + 1 },
      { r: cell.r, c: cell.c - 1 },
    ];
    for (const n of neighbors) {
      if (n.r >= 0 && n.r < rows && n.c >= 0 && n.c < cols) {
        if (gridShape[n.r][n.c]) return true;
      }
    }
  }
  return false;
};

export const generatePuzzle = (difficulty) => {
  let rows = 6,
    cols = 6,
    targetDominoes = 6,
    complexity = 1,
    disconnectChance = 0.0;
  if (difficulty === "medium") {
    rows = 7;
    cols = 7;
    targetDominoes = 9;
    complexity = 2;
    disconnectChance = 0.1;
  } else if (difficulty === "hard") {
    rows = 8;
    cols = 7;
    targetDominoes = 12;
    complexity = 3;
    disconnectChance = 0.2;
  }

  const gridShape = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(false));
  const solutionPlacement = [];
  const dominoes = [];
  let dominoIdCounter = 1;
  let attempts = 0;

  while (solutionPlacement.length < targetDominoes && attempts < 500) {
    attempts++;
    const possibleMoves = [];
    const connectingMoves = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (canPlaceDomino(r, c, false, rows, cols, gridShape)) {
          const move = { r, c, rot: 0 };
          possibleMoves.push(move);
          if (isTouchingExisting(r, c, false, rows, cols, gridShape))
            connectingMoves.push(move);
        }
        if (canPlaceDomino(r, c, true, rows, cols, gridShape)) {
          const move = { r, c, rot: 90 };
          possibleMoves.push(move);
          if (isTouchingExisting(r, c, true, rows, cols, gridShape))
            connectingMoves.push(move);
        }
      }
    }

    if (possibleMoves.length === 0) break;
    let chosenMove = null;
    if (solutionPlacement.length === 0) {
      const centralMoves = possibleMoves.filter(
        (m) => m.r > 0 && m.r < rows - 1 && m.c > 0 && m.c < cols - 1
      );
      chosenMove =
        centralMoves.length > 0
          ? centralMoves[Math.floor(Math.random() * centralMoves.length)]
          : possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    } else {
      const wantDisconnect = Math.random() < disconnectChance;
      chosenMove =
        !wantDisconnect && connectingMoves.length > 0
          ? connectingMoves[Math.floor(Math.random() * connectingMoves.length)]
          : possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }

    const { r, c, rot } = chosenMove;
    const isVert = rot === 90;
    gridShape[r][c] = true;
    if (isVert) gridShape[r + 1][c] = true;
    else gridShape[r][c + 1] = true;

    const v1 = Math.floor(Math.random() * 7);
    const v2 = Math.floor(Math.random() * 7);
    const dom = { id: `d-${dominoIdCounter++}`, v1, v2, rotation: 0 };
    dominoes.push(dom);

    solutionPlacement.push({
      dominoId: dom.id,
      r,
      c,
      v1,
      v2,
      rotation: rot,
    });
  }

  const valueGrid = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(-1));
  solutionPlacement.forEach((p) => {
    valueGrid[p.r][p.c] = p.v1;
    if (p.rotation === 0) valueGrid[p.r][p.c + 1] = p.v2;
    else valueGrid[p.r + 1][p.c] = p.v2;
  });

  const regions = [];
  const regionMap = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(-1));
  let regionIdCounter = 0;
  const palette = ["pink", "purple", "orange", "navy", "teal", "green"];
  const validCells = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (gridShape[r][c]) validCells.push({ r, c });
  validCells.sort(() => Math.random() - 0.5);

  let totalNeutralCells = 0;
  const MAX_NEUTRAL_CELLS = 5;

  validCells.forEach((cell) => {
    if (regionMap[cell.r][cell.c] !== -1) return;
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

    let isNeutral = false;
    if (
      regionCells.length <= 2 &&
      totalNeutralCells + regionCells.length <= MAX_NEUTRAL_CELLS
    ) {
      if (Math.random() < 0.25) {
        isNeutral = true;
        totalNeutralCells += regionCells.length;
      }
    }

    let chosenColor = "neutral";
    let chosenConstraint = { type: "none" };

    if (!isNeutral) {
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
            if (neighborId !== -1 && neighborId !== regionId) {
              const neighborRegion = regions.find(
                (reg) => reg._internalId === neighborId
              );
              if (neighborRegion) neighborColors.add(neighborRegion.colorTheme);
            }
          }
        });
      });
      const availableColors = palette.filter((c) => !neighborColors.has(c));
      chosenColor = (availableColors.length > 0 ? availableColors : palette)[
        Math.floor(
          Math.random() *
            (availableColors.length > 0
              ? availableColors.length
              : palette.length)
        )
      ];

      const values = regionCells.map((c) => valueGrid[c.r][c.c]);
      let possibleConstraints = [{ type: "none" }];
      const sum = values.reduce((a, b) => a + b, 0);
      possibleConstraints.push({ type: "sum", value: sum });

      if (regionCells.length > 1) {
        if (values.every((v) => v === values[0]))
          possibleConstraints.push({ type: "eq" });
        const unique = new Set(values);
        if (unique.size === values.length)
          possibleConstraints.push({ type: "neq" });
      }
      const diff = Math.floor(Math.random() * 3) + 1;
      possibleConstraints.push({ type: "gt", value: sum - diff });
      possibleConstraints.push({ type: "lt", value: sum + diff });

      const validConstraints = possibleConstraints.filter((c) => {
        if (c.type === "gt" && c.value < 0) return false;
        if (regionCells.length === 1 && c.type === "lt" && c.value > 6)
          return false;
        return true;
      });
      chosenConstraint = validConstraints[0] || { type: "none" };
      if (validConstraints.length > 1) {
        const interesting = validConstraints.filter((c) => c.type !== "none");
        chosenConstraint =
          interesting[Math.floor(Math.random() * interesting.length)];
      }
    }

    regionCells.sort((a, b) => a.r + a.c - (b.r + b.c));
    regions.push({
      id: `region-${regionId}`,
      _internalId: regionId,
      colorTheme: chosenColor,
      cells: regionCells,
      constraint: chosenConstraint,
      labelPosition: regionCells[regionCells.length - 1],
    });
  });

  return { rows, cols, gridShape, regions, initialDominoes: dominoes };
};

export const checkCompletion = (board, placements) => {
  const totalCells = board.gridShape.flat().filter(Boolean).length;
  // Note: We don't return early here if not full, because we might want to validate a partial board?
  // But App.jsx only calls this when full. So keep it safe.

  const valueGrid = Array(board.rows)
    .fill(null)
    .map(() => Array(board.cols).fill(-1));
  let gridError = false;

  for (const p of placements) {
    const dom = board.initialDominoes.find((d) => d.id === p.dominoId);
    if (!dom) continue; // Skip bad data, don't crash

    const rot = ((p.rotation % 360) + 360) % 360;
    const c1 = { r: p.r, c: p.c, v: dom.v1 };
    let c2 = { r: p.r, c: p.c, v: dom.v2 };

    if (rot === 0) c2 = { r: p.r, c: p.c + 1, v: dom.v2 };
    if (rot === 90) c2 = { r: p.r + 1, c: p.c, v: dom.v2 };
    if (rot === 180) c2 = { r: p.r, c: p.c - 1, v: dom.v2 };
    if (rot === 270) c2 = { r: p.r - 1, c: p.c, v: dom.v2 };

    const cells = [c1, c2];
    for (const cell of cells) {
      if (
        !isValidPos(cell.r, cell.c, board.rows, board.cols, board.gridShape)
      ) {
        gridError = true;
        continue;
      }
      if (valueGrid[cell.r][cell.c] !== -1) {
        gridError = true;
      }
      valueGrid[cell.r][cell.c] = cell.v;
    }
  }

  const invalidRegionIds = [];

  for (const region of board.regions) {
    const values = region.cells.map((c) => valueGrid[c.r][c.c]);

    // If any cell in this region is empty (-1), it's incomplete.
    // If we are checking "Win Condition", incomplete = invalid.
    if (values.includes(-1)) {
      // Only mark invalid if we actually expected it to be full (App logic handles this)
      // For visual feedback, an empty region isn't "Wrong", it's just empty.
      // But if the board IS full (which App.jsx ensures before calling this for win check),
      // then an empty cell implies a logic error elsewhere or overlapping.
      // Let's mark it invalid to be safe.
      invalidRegionIds.push(region.id);
      continue;
    }

    const sum = values.reduce((a, b) => a + b, 0);
    let regionValid = true;

    switch (region.constraint.type) {
      case "eq":
        if (!values.every((v) => v === values[0])) regionValid = false;
        break;
      case "neq":
        if (new Set(values).size !== values.length) regionValid = false;
        break;
      case "sum":
        if (sum !== region.constraint.value) regionValid = false;
        break;
      case "gt":
        if (sum <= region.constraint.value) regionValid = false;
        break;
      case "lt":
        if (sum >= region.constraint.value) regionValid = false;
        break;
      case "none":
      default:
        break;
    }

    if (!regionValid) invalidRegionIds.push(region.id);
  }

  // If there was a structural grid error (overlap/OOB), we can't really say which region is wrong,
  // but we definitely shouldn't return "Complete".
  // If we return !gridError && invalidRegionIds.length === 0, we are safe.

  return {
    isComplete: !gridError && invalidRegionIds.length === 0,
    invalidRegionIds,
  };
};

// // Re-export helpers needed by generator logic
// function canPlaceDomino(r, c, isVertical, rows, cols, gridShape) {
//   const r1 = r,
//     c1 = c;
//   const r2 = isVertical ? r + 1 : r;
//   const c2 = isVertical ? c : c + 1;
//   if (r1 < 0 || c1 < 0 || r1 >= rows || c1 >= cols) return false;
//   if (r2 < 0 || c2 < 0 || r2 >= rows || c2 >= cols) return false;
//   if (gridShape[r1][c1] || gridShape[r2][c2]) return false;
//   return true;
// }
