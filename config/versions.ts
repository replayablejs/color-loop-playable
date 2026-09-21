import type { ReplayableConfigInput } from '@replayablejs/config';

// Each version selects a level sequence and when its endcard appears.
export default {
  'starter-ramp': {
    params: { game: 'starter-ramp', levelsToEndcard: 3, movesToEndcard: 0 },
  },
  'challenge-ramp': {
    params: { game: 'challenge-ramp', levelsToEndcard: 4, movesToEndcard: 0 },
  },
  'switchback-reveal': {
    params: { game: 'switchback-reveal', levelsToEndcard: 2, movesToEndcard: 0 },
  },
  'quick-switchback': {
    params: { game: 'quick-switchback', levelsToEndcard: 1, movesToEndcard: 0 },
  },
  'switchback-move-teaser': {
    params: { game: 'switchback-move-teaser', levelsToEndcard: 0, movesToEndcard: 10 },
  },
} satisfies ReplayableConfigInput['versions'];
