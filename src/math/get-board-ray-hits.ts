import type { BoardCrossing, BoardGeometry, RayHit } from '#types/geometry';
import type { CellPosition, LevelModel } from '#types/level-model';

import { getCellCenter } from './get-cell-center';

// Equal-distance candidates have a stable, intentional priority.
const directionOrder = { right: 0, down: 1, left: 2, up: 3 };

/**
 * Look outward from a socket along its aligned rows and columns.
 * Each direction sees only the closest remaining chip; chips behind it are hidden.
 * Empty cells do not block these rays. Chip-chain blocking is a separate model rule.
 *
 * Supply only crossings at ONE movement position, never the whole frame.
 * Read the board again after a match: an earlier crossing may have removed chips.
 * This function finds candidates only; the model decides whether their colors match.
 */
export function getBoardRayHits(
  board: LevelModel['board'],
  grid: BoardGeometry,
  crossings: readonly BoardCrossing[],
): RayHit[] {
  const nearestByDirection = new Map<RayHit['direction'], RayHit>();

  for (const crossing of crossings) {
    if (crossing.axis === 'row') {
      inspectRow(crossing);
    } else {
      inspectColumn(crossing);
    }
  }

  return [...nearestByDirection.values()].sort(compareHits);

  function inspectRow(crossing: BoardCrossing): void {
    for (let column = 0; column < grid.columns; column++) {
      const cell = { row: crossing.index, column };
      const [chipX] = getCellCenter(grid, cell);
      const horizontalDistance = chipX - crossing.point[0];
      // A chip exactly at the ray origin belongs to both directions.
      if (horizontalDistance >= 0) {
        considerChip(cell, 'right', horizontalDistance);
      }
      if (horizontalDistance <= 0) {
        considerChip(cell, 'left', -horizontalDistance);
      }
    }
  }

  function inspectColumn(crossing: BoardCrossing): void {
    for (let row = 0; row < grid.rows; row++) {
      const cell = { row, column: crossing.index };
      const [, chipY] = getCellCenter(grid, cell);
      const verticalDistance = chipY - crossing.point[1];
      if (verticalDistance >= 0) {
        considerChip(cell, 'down', verticalDistance);
      }
      if (verticalDistance <= 0) {
        considerChip(cell, 'up', -verticalDistance);
      }
    }
  }

  /** Replace a direction's candidate only when a closer occupied cell is found. */
  function considerChip(
    cell: CellPosition,
    direction: RayHit['direction'],
    distance: number,
  ): void {
    const { row, column } = cell;
    if (!board[row]?.[column]) {
      return;
    }
    const previous = nearestByDirection.get(direction);
    if (previous && previous.distance <= distance) {
      return;
    }

    nearestByDirection.set(direction, {
      // The model uses this stable ID to avoid repeating the same rejected hit
      // while the socket remains aligned. Another direction is a different hit.
      id: `${direction}:${row}:${column}`,
      row,
      column,
      direction,
      distance,
      point: getCellCenter(grid, cell),
    });
  }
}

function compareHits(first: RayHit, second: RayHit): number {
  const distanceDifference = first.distance - second.distance;
  if (distanceDifference !== 0) {
    return distanceDifference;
  }
  return directionOrder[first.direction] - directionOrder[second.direction];
}
