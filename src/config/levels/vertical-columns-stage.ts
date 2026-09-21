import type { LevelConfig } from '#types/level';

import { b, bU, g, gU, r, rU } from '../chips';
import { roundedRect } from '../routes';

export const verticalColumnsStage = {
  level: {
    board: {
      cells: [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
      ],
      chips: [
        [rU, bU, gU],
        [rU, bU, gU],
        [rU, bU, gU],
      ],
    },
    conveyor: {
      shape: roundedRect,
      scale: 2,
      carrier: {
        sockets: 5,
        speed: 264,
        direction: 'counterclockwise',
      },
    },
    distributor: {
      capacity: 3,
      chips: [],
    },
  },
  hand: {
    slots: 3,
    initialChips: [g, b, r],
  },
} satisfies LevelConfig;
