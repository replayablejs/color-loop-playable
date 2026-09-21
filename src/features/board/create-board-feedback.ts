import { animate, release, type TweenPlaybackControls } from '@replayablejs/tween';
import type { Container } from 'pixi.js';

import type { BoardFeedback, BoardFeedbackKind } from '#types/board-feedback';
import type { BoardTile } from '#types/gameplay';

import { boardFeedback } from '../../config/board-feedback';

/** One feedback animation per chip; replacing it restores the chip's resting pose. */
export function createBoardFeedback(onIdle: () => void): BoardFeedback {
  const animations = new Map<Container, () => void>();

  return {
    anticipate,
    reject,
    stop,
    destroy,
    get animating() {
      return animations.size > 0;
    },
  };

  function anticipate(chain: readonly BoardTile[]): void {
    chain.forEach((tile, index) => play(tile, index, 'anticipation'));
  }

  function reject(chain: readonly BoardTile[]): void {
    chain.forEach((tile, index) => play(tile, index, 'rejection'));
  }

  function stop(tile: BoardTile): void {
    animations.get(tile.container)?.();
  }

  function destroy(): void {
    for (const stopAnimation of animations.values()) {
      stopAnimation();
    }
  }

  function play(tile: BoardTile, index: number, kind: BoardFeedbackKind): void {
    stop(tile);

    const chip = tile.container;
    const position = chip.position;
    const skew = chip.skew;
    const { x, y } = position;
    const animation =
      kind === 'anticipation'
        ? playAnticipation(tile, index, finish)
        : playRejection(tile, index, finish);

    animations.set(chip, finish);

    function finish(): void {
      animation.stop();
      release(position);
      release(skew);
      position.set(x, y);
      skew.set(0, 0);
      animations.delete(chip);
      if (animations.size === 0) {
        onIdle();
      }
    }
  }
}

/** Lift and lean in the chip's arrow direction, then settle back into its cell. */
function playAnticipation(
  tile: BoardTile,
  index: number,
  onComplete: () => void,
): TweenPlaybackControls {
  const { liftDuration, settleDuration, lift, skew, stagger } = boardFeedback.anticipation;
  const { position, skew: chipSkew } = tile.container;
  const duration = liftDuration + settleDuration;
  const timing = {
    at: index * stagger,
    duration,
    times: [0, liftDuration / duration, 1],
  };
  const leanX = tile.direction === 'up' ? skew : tile.direction === 'down' ? -skew : 0;
  const leanY = tile.direction === 'left' ? skew : tile.direction === 'right' ? -skew : 0;

  return animate(
    [
      [
        position,
        { y: [position.y, position.y - lift, position.y] },
        {
          ...timing,
          // Cubic out/in matches power2 out/in in the reference.
          ease: [
            [1 / 3, 1, 2 / 3, 1],
            [1 / 3, 0, 2 / 3, 0],
          ],
        },
      ],
      [
        chipSkew,
        { x: [0, leanX, 0], y: [0, leanY, 0] },
        {
          ...timing,
          // Cubic out/in matches power2 out/in in the reference.
          ease: [
            [1 / 3, 1, 2 / 3, 1],
            [1 / 3, 0, 2 / 3, 0],
          ],
        },
      ],
    ],
    { onComplete },
  );
}

/** Three short horizontal steps: left, right, then the original position. */
function playRejection(
  tile: BoardTile,
  index: number,
  onComplete: () => void,
): TweenPlaybackControls {
  const { stepDuration, distance, stagger } = boardFeedback.rejection;
  const { position } = tile.container;
  const { x } = position;
  return animate(
    position,
    { x: [x, x - distance, x + distance, x] },
    {
      duration: stepDuration * 3,
      delay: index * stagger,
      times: [0, 1 / 3, 2 / 3, 1],
      ease: 'easeOut',
      onComplete,
    },
  );
}
