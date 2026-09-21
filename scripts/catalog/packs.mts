import type { PackDescription } from './types.mts';

export const packs: Record<string, PackDescription> = {
  'starter-ramp': {
    name: 'Starter Ramp',
    description: 'A gentle introduction. Complete three levels to reveal the endcard board.',
  },
  'challenge-ramp': {
    name: 'Challenge Ramp',
    description: 'A longer sequence of puzzles. Complete four levels to reveal the endcard board.',
  },
  'switchback-reveal': {
    name: 'Switchback Reveal',
    description:
      'Complete two levels, including the switchback puzzle, before the endcard appears.',
  },
  'quick-switchback': {
    name: 'Quick Switchback',
    description: 'One switchback puzzle leads straight to the endcard board.',
  },
  'switchback-move-teaser': {
    name: 'Switchback Move Teaser',
    description: 'The endcard opens after ten accepted color selections while gameplay continues.',
  },
};
