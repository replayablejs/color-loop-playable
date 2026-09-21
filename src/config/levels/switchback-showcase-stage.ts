import type { LevelConfig } from '#types/level';

import {
  __,
  bD,
  bL,
  bR,
  bU,
  gD,
  gL,
  gR,
  gU,
  oD,
  oL,
  oR,
  oU,
  pD,
  pL,
  pR,
  pU,
  rD,
  rL,
  rR,
  rU,
  yD,
  yL,
  yR,
  yU,
} from '../chips';
import { switchbackTrack } from '../routes';

export const switchbackShowcaseStage = {
  level: {
    board: {
      cells: [
        [1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1],
      ],
      chips: [
        [rR, rD, gR, gD, __, __, __, bR, bD, oR, oD],
        [rU, rL, gU, gL, __, __, __, bU, bL, oU, oL],
        [pR, pD, yR, yD, __, __, __, rR, rD, gR, gD],
        [pU, pL, yU, yL, __, __, __, rU, rL, gU, gL],
        [bR, bD, oR, oD, __, __, __, pR, pD, yR, yD],
        [bU, bL, oU, oL, __, __, __, pU, pL, yU, yL],
        [rR, rD, gR, gD, __, __, __, bR, bD, oR, oD],
        [rU, rL, gU, gL, __, __, __, bU, bL, oU, oL],
        [pR, pD, yR, yD, __, __, __, rR, rD, gR, gD],
        [pU, pL, yU, yL, __, __, __, rU, rL, gU, gL],
      ],
    },
    conveyor: {
      shape: switchbackTrack,
      scale: 1.6,
      carrier: {
        sockets: 10,
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
    slots: 5,
    initialChips: [],
  },
} satisfies LevelConfig;
