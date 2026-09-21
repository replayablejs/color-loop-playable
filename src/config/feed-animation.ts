import { levelStyle } from './level';

/** Start ahead of the pickup point; faster belts use a shorter flight. */
export const feedAnimation = {
  travelDistance: 70,
  minDuration: 0.14,
  maxDuration: 0.35,
  lift: levelStyle.chipSize * 0.55,
  peakScale: 1.3,
};
