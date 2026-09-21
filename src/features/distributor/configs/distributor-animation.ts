import { levelStyle } from '../../../config/level';

/** Reference timings in seconds; offsets scale with the local chip artwork. */
export const distributorAnimation = {
  enterDuration: 0.18,
  moveDuration: 0.16,
  settleDuration: 0.1,
  stagger: 0.025,
  enterOffset: levelStyle.chipSize * 0.16,
  overshoot: levelStyle.chipSize * 0.08,
  rotation: 0.09,
};
