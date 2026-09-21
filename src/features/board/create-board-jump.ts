import type { Container } from 'pixi.js';

import type { BoardMatch } from '#types/board-jump';

import { boardJump } from '../../config/board-jump';
import { levelStyle } from '../../config/level';
import { createTile } from '../tile/create-tile';
import { playChipJump } from '../tile/play-chip-jump';

/** The carried chip leaves the conveyor at the exact matching position. */
export function createBoardJump(match: BoardMatch, onComplete: () => void): Container {
  const container = createTile('dot', levelStyle.chipSize, match.color);
  container.label = 'board-jump';
  container.position.set(...match.start);

  playChipJump(container, {
    landing: match.landing,
    direction: match.direction,
    duration: boardJump.incomingDuration,
    onComplete,
  });
  return container;
}
