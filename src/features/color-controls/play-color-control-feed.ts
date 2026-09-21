import { playable } from '@replayablejs/runtime';
import { animate, type TweenPlaybackControls } from '@replayablejs/tween';
import type { Container } from 'pixi.js';

import { colorControlsStyle } from './configs/color-controls-style';

/** Slide toward the playfield and fade out, matching the reference's 0.14s feed. */
export function playColorControlFeed(
  chip: Container,
  onComplete: () => void,
): TweenPlaybackControls {
  const portrait = playable.screen.orientation === 'portrait';
  const distance = colorControlsStyle.chipSize * 0.7;

  return animate(
    chip,
    {
      x: chip.x - (portrait ? 0 : distance),
      y: chip.y - (portrait ? distance : 0),
      alpha: 0,
    },
    {
      duration: 0.14,
      // Cubic ease-out matches the reference's GSAP power2.out.
      ease: [1 / 3, 1, 2 / 3, 1],
      onComplete,
    },
  );
}
