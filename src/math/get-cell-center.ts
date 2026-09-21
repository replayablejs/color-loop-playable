import type { BoardGeometry } from '#types/geometry';
import type { RoutePoint } from '#types/level';
import type { CellPosition } from '#types/level-model';

/**
 * Convert a zero-based cell address into a center in local board coordinates.
 * The board origin is (0, 0), x grows right, and y grows down.
 * Rendering and collision checks share this calculation to stay aligned.
 */
export function getCellCenter(grid: BoardGeometry, cell: CellPosition): RoutePoint {
  // Three columns have their middle at index 1; four have it at index 1.5.
  // The half-index naturally puts even-sized grids around the origin too.
  const middleColumn = (grid.columns - 1) / 2;
  const middleRow = (grid.rows - 1) / 2;

  // Spacing is center-to-center (chip size + gap), not just the chip width.
  // Empty cells still count: removing a chip must never shift its neighbours.
  const x = (cell.column - middleColumn) * grid.spacing;
  const y = (cell.row - middleRow) * grid.spacing;
  return [x, y];
}
