import type { GameConfig } from '#types/level';

import { colorMazeStage, staircaseStage, switchbackShowcaseStage } from '../levels';

export const switchbackRevealGame = {
  levels: [staircaseStage, switchbackShowcaseStage, colorMazeStage],
} satisfies GameConfig;
