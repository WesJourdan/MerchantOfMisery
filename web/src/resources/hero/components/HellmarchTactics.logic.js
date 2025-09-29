export const GRID_ROWS = 10;
export const GRID_COLS = 10;
export const TILE_SIZE = 1;
export const MOVE_RANGE = 3;
export const STEP_DURATION = 260;

export const directions = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const clampLog = (entries, limit = 8) => entries.slice(Math.max(0, entries.length - limit));

export const tileKey = ({ row, col }) => `${row}:${col}`;

export const withinBounds = (row, col) => row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS;

export const tileToWorld = ({ row, col }) => {
  const x = (col - (GRID_COLS - 1) / 2) * TILE_SIZE;
  const z = ((GRID_ROWS - 1) / 2 - row) * TILE_SIZE;
  return [x, 0, z];
};

export const areAdjacent = (a, b) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;

export const findPath = (start, goal, blocked = new Set()) => {
  const queue = [start];
  const visited = new Set([tileKey(start)]);
  const parents = new Map();

  while(queue.length) {
    const current = queue.shift();
    if(current.row === goal.row && current.col === goal.col) {
      const path = [];
      let cursor = current;
      while(cursor) {
        path.unshift(cursor);
        cursor = parents.get(tileKey(cursor));
      }
      return path;
    }

    for(const [dr, dc] of directions) {
      const next = { row: current.row + dr, col: current.col + dc };
      if(!withinBounds(next.row, next.col)) continue;
      const nextKey = tileKey(next);
      if(blocked.has(nextKey)) continue;
      if(visited.has(nextKey)) continue;
      visited.add(nextKey);
      parents.set(nextKey, current);
      queue.push(next);
    }
  }

  return null;
};

export const boardFromPoint = (point) => {
  const halfWidth = (GRID_COLS * TILE_SIZE) / 2;
  const halfHeight = (GRID_ROWS * TILE_SIZE) / 2;
  const col = Math.floor((point.x + halfWidth) / TILE_SIZE);
  const row = Math.floor((halfHeight - point.z) / TILE_SIZE);
  if(!withinBounds(row, col)) return null;
  return { row, col };
};

export const computeMovementPath = (start, tile, enemy) => {
  if(!tile) return null;
  const enemyKey = enemy ? tileKey(enemy) : null;
  const blocked = new Set(enemyKey ? [enemyKey] : []);

  if(enemy && tileKey(tile) === enemyKey) {
    if(areAdjacent(start, enemy)) return [];

    let bestPath = null;
    for(const [dr, dc] of directions) {
      const candidate = { row: enemy.row + dr, col: enemy.col + dc };
      if(!withinBounds(candidate.row, candidate.col)) continue;
      if(tileKey(candidate) === tileKey(start)) {
        bestPath = [start, candidate];
        break;
      }
      if(enemy && tileKey(candidate) === enemyKey) continue;
      const path = findPath(start, candidate, blocked);
      if(path && path.length && (!bestPath || path.length < bestPath.length)) {
        bestPath = path;
      }
    }
    return bestPath;
  }

  return findPath(start, tile, blocked);
};
