import {
  GRID_COLS,
  GRID_ROWS,
  MOVE_RANGE,
  TILE_SIZE,
  areAdjacent,
  boardFromPoint,
  clampLog,
  computeMovementPath,
  findPath,
  tileKey,
  tileToWorld,
} from "../HellmarchTactics.logic";

describe("Hellmarch tactics logic", () => {
  it("finds a shortest path that avoids blocked tiles", () => {
    const start = { row: 0, col: 0 };
    const goal = { row: 0, col: 3 };
    const blocked = new Set([tileKey({ row: 0, col: 1 })]);

    const path = findPath(start, goal, blocked);

    expect(path).toEqual([
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 1, col: 2 },
      { row: 0, col: 2 },
      { row: 0, col: 3 },
    ]);
  });

  it("returns an empty path when already adjacent to an engaged enemy", () => {
    const player = { row: 4, col: 4 };
    const enemy = { row: 4, col: 5 };

    const path = computeMovementPath(player, enemy, enemy);

    expect(path).toEqual([]);
  });

  it("finds an adjacent flank position when targeting an enemy tile", () => {
    const player = { row: GRID_ROWS - 2, col: Math.floor(GRID_COLS / 2) };
    const enemy = { row: player.row - 3, col: player.col + 1 };

    const path = computeMovementPath(player, enemy, enemy);

    const lastStep = path[path.length - 1];
    expect(lastStep).not.toEqual(enemy);
    expect(areAdjacent(lastStep, enemy)).toBe(true);
    expect(path.length - 1).toBeLessThanOrEqual(MOVE_RANGE + 1);
  });

  it("maps canvas hit points to board coordinates", () => {
    const halfWidth = (GRID_COLS * TILE_SIZE) / 2;
    const halfHeight = (GRID_ROWS * TILE_SIZE) / 2;

    expect(boardFromPoint({ x: -halfWidth, z: halfHeight })).toEqual({ row: 0, col: 0 });
    expect(boardFromPoint({ x: halfWidth - 0.01, z: -halfHeight + 0.01 })).toEqual({
      row: GRID_ROWS - 1,
      col: GRID_COLS - 1,
    });
    expect(boardFromPoint({ x: halfWidth + 1, z: 0 })).toBeNull();
  });

  it("converts board coordinates to world positions", () => {
    const world = tileToWorld({ row: 0, col: 0 });
    const mirrored = tileToWorld({ row: GRID_ROWS - 1, col: GRID_COLS - 1 });

    expect(world[1]).toBe(0);
    expect(mirrored[0]).toBeCloseTo(-world[0]);
    expect(mirrored[2]).toBeCloseTo(-world[2]);
  });

  it("limits combat log entries to the newest items", () => {
    const entries = Array.from({ length: 12 }, (_, index) => `entry-${index}`);
    const trimmed = clampLog(entries, 5);

    expect(trimmed).toEqual(["entry-7", "entry-8", "entry-9", "entry-10", "entry-11"]);
  });

  it("detects adjacency on the grid", () => {
    expect(areAdjacent({ row: 0, col: 0 }, { row: 0, col: 1 })).toBe(true);
    expect(areAdjacent({ row: 0, col: 0 }, { row: 1, col: 1 })).toBe(false);
  });
});
