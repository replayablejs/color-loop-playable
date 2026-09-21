import type { ChipDirection } from '#types/chip';
import type { ChipConfig } from '#types/level';
import type { CellPosition } from '#types/level-model';

const directionSteps: Record<ChipDirection, CellPosition> = {
  up: { row: -1, column: 0 },
  right: { row: 0, column: 1 },
  down: { row: 1, column: 0 },
  left: { row: 0, column: -1 },
};

/**
 * Collect same-color chips in arrow order, skipping empty playable cells.
 * Another color blocks the chain. An edge, hole, arrowless chip, or already
 * visited chip ends it without rejection; visited cells prevent infinite loops.
 */
export function findChipChain(
  cells: readonly (readonly number[])[],
  board: readonly (readonly (ChipConfig | null)[])[],
  start: CellPosition,
): { chain: CellPosition[]; blocked: boolean } {
  const chain: CellPosition[] = [];
  const visitedCells = new Set<string>();
  let position = start;

  while (true) {
    const chip = board[position.row]?.[position.column];
    const cellKey = `${position.row}:${position.column}`;
    if (chip == null || cells[position.row]?.[position.column] !== 1 || visitedCells.has(cellKey)) {
      return { chain, blocked: false };
    }

    visitedCells.add(cellKey);
    chain.push(position);

    if (chip.direction == null) {
      return { chain, blocked: false };
    }

    const step = directionSteps[chip.direction];
    let row = position.row + step.row;
    let column = position.column + step.column;

    // Empty cells carry the ray forward; holes and board edges stop it.
    while (cells[row]?.[column] === 1 && board[row]?.[column] == null) {
      row += step.row;
      column += step.column;
    }

    const nextChip = cells[row]?.[column] === 1 ? board[row]?.[column] : null;
    if (nextChip == null) {
      return { chain, blocked: false };
    }
    if (nextChip.color !== chip.color) {
      return { chain, blocked: true };
    }

    position = { row, column };
  }
}
