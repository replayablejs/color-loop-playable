import type { BoardCrossing, BoardGeometry } from '#types/geometry';
import type { RoutePoint } from '#types/level';

import { getCellCenter } from './get-cell-center';

// Floating-point interpolation may land microscopically beside a grid line.
const positionTolerance = 1e-6;
const progressTolerance = 1e-6;

/**
 * Find where ONE straight movement piece lines up with board rows or columns.
 * This detects alignments even when a fast socket passes them between frames.
 * Use the pieces from route.trace(), not a shortcut across a conveyor corner.
 *
 * Results are ordered by travel progress. Row and column crossings with the
 * same progress describe one position and should be checked together.
 * To inspect a stationary/initial position, pass the same start and end point.
 */
export function getBoardCrossings(
  grid: BoardGeometry,
  start: RoutePoint,
  end: RoutePoint,
): BoardCrossing[] {
  const crossings: BoardCrossing[] = [];
  addRowCrossings();
  addColumnCrossings();
  return crossings.sort((first, second) => first.progress - second.progress);

  function addRowCrossings(): void {
    for (let row = 0; row < grid.rows; row++) {
      const [, rowY] = getCellCenter(grid, { row, column: 0 });
      const progress = getAlignmentProgress(start[1], end[1], rowY);
      if (progress !== undefined) {
        addCrossing('row', row, progress);
      }
    }
  }

  function addColumnCrossings(): void {
    for (let column = 0; column < grid.columns; column++) {
      const [columnX] = getCellCenter(grid, { row: 0, column });
      const progress = getAlignmentProgress(start[0], end[0], columnX);
      if (progress !== undefined) {
        addCrossing('column', column, progress);
      }
    }
  }

  /** Recover the full 2D position from the fraction along this movement. */
  function addCrossing(axis: BoardCrossing['axis'], index: number, progress: number): void {
    const x = start[0] + (end[0] - start[0]) * progress;
    const y = start[1] + (end[1] - start[1]) * progress;
    crossings.push({ axis, index, progress, point: [x, y] });
  }
}

/** Solve start + movement * progress = target for one coordinate. */
function getAlignmentProgress(start: number, end: number, target: number): number | undefined {
  const movement = end - start;
  if (Math.abs(movement) <= positionTolerance) {
    // Parallel movement either never meets the line, or stays on it throughout.
    // In the latter case, check the endpoint once (also covers stationary chips).
    const alreadyAligned = Math.abs(start - target) <= positionTolerance;
    return alreadyAligned ? 1 : undefined;
  }

  const progress = (target - start) / movement;
  // The preceding piece already checked this one's starting point. Include
  // the ending point, but exclude the start and anything outside this movement.
  if (progress <= progressTolerance || progress > 1) {
    return undefined;
  }
  return progress;
}
