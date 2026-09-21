import { animate, release } from '@replayablejs/tween';
import type { Container } from 'pixi.js';

import type { ChipJumpOptions } from '#types/board-jump';

import { boardJump } from '../../config/board-jump';

/** Play one jump, then remove its artwork. Replayable owns pause/resume timing. */
export function playChipJump(
  chip: Container,
  { landing, direction, duration, onComplete }: ChipJumpOptions,
): void {
  const indicator = chip.getChildByLabel('indicator')!;
  // Retain targets because Pixi clears transforms before its destroyed event.
  const position = chip.position;
  const pivot = chip.pivot;
  const scale = chip.scale;
  const { lift, peakScale, flipStart, flipEnd } = boardJump;
  const horizontal = direction === 'left' || direction === 'right';

  const animation = animate(
    [
      [position, { x: landing[0], y: landing[1] }, { at: 0, duration, ease: 'linear' }],
      [
        pivot,
        { y: [0, lift, 0] },
        {
          at: 0,
          duration,
          times: [0, 0.5, 1],
          // Cubic curves approximate the reference's power3 lift and return.
          ease: [
            [0.22, 1, 0.36, 1],
            [0.64, 0, 0.78, 0],
          ],
        },
      ],
      [
        scale,
        {
          x: [1, horizontal ? -1 : peakScale, 1],
          y: [1, horizontal ? peakScale : -1, 1],
        },
        {
          at: duration * flipStart,
          duration: duration * (flipEnd - flipStart),
          times: [0, 0.5, 1],
          ease: [
            [0.61, 1, 0.88, 1],
            [0.12, 0, 0.39, 0],
          ],
        },
      ],
      [indicator, { alpha: 0 }, { at: duration * flipStart, duration: 0 }],
      [indicator, { alpha: 1 }, { at: duration * flipEnd, duration: 0 }],
    ],
    { onComplete: finish },
  );

  chip.once('destroyed', stop);

  function finish(): void {
    chip.destroy({ children: true });
    onComplete();
  }

  /** Discard queued property writes before Pixi destroys the animated targets. */
  function stop(): void {
    animation.stop();
    release(position);
    release(pivot);
    release(scale);
    release(indicator);
  }
}
