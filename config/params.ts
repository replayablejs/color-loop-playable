import type { ReplayableParamsInput } from '@replayablejs/config';

export default {
  game: {
    type: 'string',
    default: 'starter-ramp',
    options: [
      'starter-ramp',
      'challenge-ramp',
      'switchback-reveal',
      'quick-switchback',
      'switchback-move-teaser',
    ],
    description: 'Level sequence used by this gameplay version.',
  },
  levelsToEndcard: {
    type: 'number',
    default: 3,
    range: { min: 0, max: 10, step: 1 },
    description:
      'Completed levels before revealing the endcard on the next board. 0 disables the limit.',
  },
  movesToEndcard: {
    type: 'number',
    default: 0,
    range: { min: 0, max: 100, step: 1 },
    description:
      'Accepted color selections before the endcard, across all levels. 0 disables the limit.',
  },
  tutorial: {
    type: 'boolean',
    default: true,
    description: 'Demonstrate a color-control tap until the first selection in the playable.',
  },
} satisfies ReplayableParamsInput;
