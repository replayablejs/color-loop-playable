import type { GameConfig } from '#types/level';

import { challengeRampGame } from './challenge-ramp-game';
import { quickSwitchbackGame } from './quick-switchback-game';
import { starterRampGame } from './starter-ramp-game';
import { switchbackMoveTeaserGame } from './switchback-move-teaser-game';
import { switchbackRevealGame } from './switchback-reveal-game';

/** Resolve the sequence selected by Replayable's version parameters. */
export function getGameConfig(name: string): GameConfig {
  const game = games[name];
  if (!game) {
    throw new Error(`Unknown gameplay sequence: ${name}`);
  }
  return game;
}

const games: Record<string, GameConfig> = {
  'starter-ramp': starterRampGame,
  'challenge-ramp': challengeRampGame,
  'switchback-reveal': switchbackRevealGame,
  'quick-switchback': quickSwitchbackGame,
  'switchback-move-teaser': switchbackMoveTeaserGame,
};
