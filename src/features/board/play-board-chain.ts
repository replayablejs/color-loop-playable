import type { BoardChainOptions } from '#types/board-feedback';
import type { BoardTile } from '#types/gameplay';
import type { RoutePoint } from '#types/level';

import { boardJump } from '../../config/board-jump';
import { levelStyle } from '../../config/level';
import { playSound } from '../audio/play-sound';
import { playChipJump } from '../tile/play-chip-jump';

/** Each landing starts the next chip. Destroying the board stops the current jump. */
export function playBoardChain(
  tiles: readonly BoardTile[],
  { beforeJump, onComplete }: BoardChainOptions,
): void {
  let index = 0;
  playNext();

  function playNext(): void {
    const tile = tiles[index];
    if (!tile) {
      onComplete();
      return;
    }

    playSound('match');
    beforeJump(tile);
    const next = tiles[index + 1];
    const landing: RoutePoint = next ? [next.container.x, next.container.y] : getExitPosition(tile);

    index++;
    playChipJump(tile.container, {
      landing,
      direction: tile.direction,
      duration: boardJump.chainDuration,
      onComplete: playNext,
    });
  }
}

/** The final chip continues one cell along its arrow before disappearing. */
function getExitPosition({ container, direction }: BoardTile): RoutePoint {
  const distance = levelStyle.chipSize + levelStyle.chipGap;
  switch (direction) {
    case 'right':
      return [container.x + distance, container.y];
    case 'left':
      return [container.x - distance, container.y];
    case 'down':
      return [container.x, container.y + distance];
    case 'up':
      return [container.x, container.y - distance];
    // A terminal dot has no outgoing direction; give it a final jump in place.
    default:
      return [container.x, container.y];
  }
}
