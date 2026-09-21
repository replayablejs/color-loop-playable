import type { LevelConfig } from '#types/level';

import { bD, bL, bR, bU, gL, gR, gU, pD, pL, pR, pU, yD, yL, yR, yU } from '../chips';
import { roundedRect } from '../routes';

export const colorMazeStage = {
  level: {
    board: {
      cells: [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
      ],
      chips: [
        [bL, bL, gR, gR, gR, gU, bD, yD],
        [bR, bU, yR, yR, yR, yD, bR, bD],
        [gR, gU, pU, bU, pU, yR, yR, bR],
        [bR, bU, pU, bU, pU, pD, gR, gR],
        [pL, bU, pU, bU, pU, pL, gU, yD],
        [pU, bU, gR, gR, gR, gR, gU, yD],
        [bL, yL, yL, yL, pR, pD, yD, yL],
        [bU, gL, gL, yU, pU, pD, yD, bD],
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
      capacity: 6,
      chips: [],
    },
  },
  hand: {
    slots: 4,
    initialChips: [],
  },
} satisfies LevelConfig;
