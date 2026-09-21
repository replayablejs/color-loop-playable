import { animate, type TweenPlaybackControls } from '@replayablejs/tween';
import type { Container } from 'pixi.js';

import { distributorAnimation as motion } from './configs/distributor-animation';

/** The new chip enters underneath the queue, slightly small and tilted. */
export function animateStackEntry(
  chip: Container,
  y: number,
  sequence: number,
): TweenPlaybackControls {
  chip.y = y + motion.enterOffset;
  chip.alpha = 0;
  chip.rotation = getTilt(1, sequence);
  chip.scale.set(0.92);

  return animate([
    [chip, { y, alpha: 1, rotation: 0 }, { duration: motion.enterDuration, ease: 'backOut' }],
    [chip.scale, { x: 1, y: 1 }, { at: 0, duration: motion.enterDuration, ease: 'backOut' }],
  ]);
}

/** Existing chips shift upward, starting near the insertion, then settle. */
export function animateStackShift(
  chip: Container,
  y: number,
  index: number,
  count: number,
  sequence: number,
): TweenPlaybackControls {
  const delay = Math.max(0, count - index - 2) * motion.stagger;
  const overshootY = y - motion.overshoot;

  return animate([
    [
      chip,
      { y: overshootY, rotation: getTilt(index, sequence) },
      {
        at: delay,
        duration: motion.moveDuration,
        ease: [1 / 3, 1, 2 / 3, 1],
      },
    ],
    // Explicit bounce contacts avoid a custom easing function. Each rebound
    // loses height, ending at the exact stack position without residual tilt.
    [
      chip,
      {
        y: [overshootY, y, y - motion.overshoot / 4, y, y - motion.overshoot / 16, y],
        rotation: 0,
      },
      {
        duration: motion.settleDuration,
        times: [0, 0.36, 0.55, 0.73, 0.82, 1],
        ease: 'easeInOut',
      },
    ],
  ]);
}

/** Alternate small tilts as chips are inserted, matching the reference pattern. */
function getTilt(index: number, sequence: number): number {
  const direction = (index + sequence) % 2 === 0 ? -1 : 1;
  const variation = 0.75 + ((index + sequence * 2) % 3) * 0.18;
  return direction * motion.rotation * variation;
}
