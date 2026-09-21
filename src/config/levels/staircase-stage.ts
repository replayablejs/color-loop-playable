import type { LevelConfig } from '#types/level';

import { __, bR, bU, gR, rR, rU, yR, yU } from '../chips';
import { roundedRect } from '../routes';

export const staircaseStage = {
  level: {
    board: {
      cells: [
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
      ],
      chips: [
        [gR, gR, gR, gR, gR],
        [rR, rR, rR, rR, rR],
        [rU, yR, yR, yR, __],
        [rU, yU, bR, bR, __],
        [rU, yU, bU, __, __],
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
      capacity: 4,
      chips: [],
    },
  },
  hand: {
    slots: 4,
    initialChips: [],
  },
} satisfies LevelConfig;
