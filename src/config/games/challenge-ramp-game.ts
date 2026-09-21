import type { GameConfig } from '#types/level';

import {
  colorMazeStage,
  compactGreenStage,
  staircaseStage,
  switchbackShowcaseStage,
  verticalColumnsStage,
} from '../levels';

export const challengeRampGame = {
  levels: [
    compactGreenStage,
    verticalColumnsStage,
    staircaseStage,
    colorMazeStage,
    switchbackShowcaseStage,
  ],
} satisfies GameConfig;
