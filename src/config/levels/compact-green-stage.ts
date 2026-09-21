import type { LevelConfig } from '#types/level';

import { gL, gR, gU } from '../chips';
import { roundedRect } from '../routes';

export const compactGreenStage = {
  level: {
    board: {
      cells: [
        [1, 1],
        [1, 1],
      ],
      chips: [
        [gL, gL],
        [gR, gU],
      ],
    },
    conveyor: {
      shape: roundedRect,
      scale: 2,
      carrier: {
        sockets: 5,
        speed: 264,
        direction: 'clockwise',
      },
    },
    distributor: {
      capacity: 1,
      chips: [],
    },
  },
  hand: {
    slots: 1,
    initialChips: [],
  },
} satisfies LevelConfig;
