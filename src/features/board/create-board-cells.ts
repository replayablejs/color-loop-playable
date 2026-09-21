import { Graphics } from 'pixi.js';

import type { BoardGeometry } from '#types/geometry';
import type { LevelConfig } from '#types/level';

import { boardCellStyle } from '../../config/level';
import { palette } from '../../config/palette';
import { getCellCenter } from '../../math/get-cell-center';

/** Draw active cells once; this layer remains beneath moving and cleared chips. */
export function createBoardCells(
  cells: LevelConfig['level']['board']['cells'],
  grid: BoardGeometry,
): Graphics {
  const artwork = new Graphics({ label: 'board-cells' });
  const { size, radius } = boardCellStyle;

  for (const [row, columns] of cells.entries()) {
    for (const [column, active] of columns.entries()) {
      if (active !== 1) {
        continue;
      }
      const [x, y] = getCellCenter(grid, { row, column });
      artwork.roundRect(x - size / 2, y - size / 2, size, size, radius);
    }
  }
  artwork.fill(palette.boardCell);
  return artwork;
}
