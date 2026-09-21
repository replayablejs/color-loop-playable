import type { GameConfig } from '#types/level';

import { staircaseStage, switchbackShowcaseStage } from '../levels';

export const quickSwitchbackGame = {
  levels: [switchbackShowcaseStage, staircaseStage],
} satisfies GameConfig;
