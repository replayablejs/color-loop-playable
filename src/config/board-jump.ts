import { levelStyle } from './level';

/** Shared jump shape; conveyor entry and chain steps have separate durations. */
export const boardJump = {
  incomingDuration: 0.4,
  chainDuration: 0.35,
  lift: levelStyle.chipSize * 0.5,
  peakScale: 1.15,
  flipStart: 0.2,
  flipEnd: 0.82,
} as const;
