import type { GameConfig } from '#types/level';

import { colorMazeStage, compactGreenStage, staircaseStage, verticalColumnsStage } from '../levels';

export const starterRampGame = {
  levels: [
    compactGreenStage,
    verticalColumnsStage,
    staircaseStage,
    // Revealed after the last playable stage as the moving endcard backdrop.
    colorMazeStage,
  ],
} satisfies GameConfig;
