import { Container } from 'pixi.js';

import type { BoardMatch } from '#types/board-jump';
import type { BoardOptions, BoardSnapshot, BoardTile, BoardView } from '#types/gameplay';

import { levelStyle } from '../../config/level';
import { getCellCenter } from '../../math/get-cell-center';
import { playSound } from '../audio/play-sound';
import { createTile } from '../tile/create-tile';
import { createBoardCells } from './create-board-cells';
import { createBoardFeedback } from './create-board-feedback';
import { createBoardJump } from './create-board-jump';
import { playBoardChain } from './play-board-chain';

/** Own incoming jumps and chain clears while the model applies matches immediately. */
export function createBoard({ config, onIdle }: BoardOptions): BoardView {
  const container = new Container({ label: 'board' });
  const animationLayer = new Container({ label: 'board-animations' });

  let activeMatches = 0;
  let boardChips: BoardSnapshot = config.chips;

  const grid = {
    rows: config.cells.length,
    columns: Math.max(0, ...config.cells.map((row) => row.length)),
    spacing: levelStyle.chipSize + levelStyle.chipGap,
  };
  const cells = createBoardCells(config.cells, grid);
  const tiles = createTiles();
  const heldTiles = new Set<Container>();
  const feedback = createBoardFeedback(notifyIdle);

  container.addChild(cells, ...tiles.map((tile) => tile.container));
  // Clearing edge tiles must not shrink or recenter the board's layout bounds.
  container.boundsArea = container.getLocalBounds().rectangle.clone();

  container.once('destroyed', () => {
    onIdle = () => {};
    feedback.destroy();
  });

  return {
    container,
    animationLayer,
    refresh,
    playMatch,
    get idle() {
      return activeMatches === 0 && !feedback.animating;
    },
  };

  function notifyIdle(): void {
    if (activeMatches === 0 && !feedback.animating) {
      onIdle();
    }
  }

  function refresh(chips: BoardSnapshot): void {
    boardChips = chips;
    updateVisibility();
  }

  function updateVisibility(): void {
    for (const { row, column, container: tile } of tiles) {
      tile.visible = heldTiles.has(tile) || boardChips[row]?.[column] != null;
    }
  }

  function playMatch(match: BoardMatch): void {
    // Preserve chain order; board storage itself is in row/column order.
    const chain = match.chain.map((cell) =>
      tiles.find((tile) => tile.row === cell.row && tile.column === cell.column)!,
    );
    if (match.status === 'reject') {
      playSound('rejection');
      feedback.reject(chain);
      return;
    }

    for (const tile of chain) {
      heldTiles.add(tile.container);
    }
    activeMatches++;
    feedback.anticipate(chain);

    const incomingChip = createBoardJump(match, () => {
      playBoardChain(chain, { beforeJump: prepareJump, onComplete: finishMatch });
    });
    animationLayer.addChild(incomingChip);

    function finishMatch(): void {
      for (const tile of chain) {
        heldTiles.delete(tile.container);
      }
      activeMatches--;
      updateVisibility();
      notifyIdle();
    }
  }

  function prepareJump(tile: BoardTile): void {
    feedback.stop(tile);
    // Both layers share level coordinates; lift artwork above the belt only while jumping.
    animationLayer.addChild(tile.container);
  }

  /** Keep cell addresses alongside artwork so refresh needs no position lookup. */
  function createTiles(): BoardTile[] {
    const boardTiles: BoardTile[] = [];

    for (const [row, chips] of config.chips.entries()) {
      for (const [column, chip] of chips.entries()) {
        // Empty cells keep their background; holes have neither cells nor chips.
        if (config.cells[row]?.[column] !== 1 || chip === null) {
          continue;
        }

        const tile = createTile(chip.direction ?? 'dot', levelStyle.chipSize, chip.color);
        tile.position.set(...getCellCenter(grid, { row, column }));
        const boardTile = { row, column, container: tile, direction: chip.direction };
        boardTiles.push(boardTile);
        // Cleared chips leave the live collection as soon as their jump destroys them.
        tile.once('destroyed', () => {
          boardTiles.splice(boardTiles.indexOf(boardTile), 1);
          heldTiles.delete(tile);
        });
      }
    }

    return boardTiles;
  }
}
