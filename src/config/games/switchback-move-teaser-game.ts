import type { GameConfig } from '#types/level';

import { staircaseStage, switchbackShowcaseStage } from '../levels';

export const switchbackMoveTeaserGame = {
  levels: [switchbackShowcaseStage, staircaseStage],
} satisfies GameConfig;
