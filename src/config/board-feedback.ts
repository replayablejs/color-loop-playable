import { levelStyle } from './level';

export const boardFeedback = {
  anticipation: {
    liftDuration: 0.1,
    settleDuration: 0.12,
    lift: levelStyle.chipSize * 0.05,
    skew: 0.18,
    stagger: 0.035,
  },
  rejection: {
    stepDuration: 0.08,
    distance: levelStyle.chipSize * 0.08,
    stagger: 0.04,
  },
} as const;
