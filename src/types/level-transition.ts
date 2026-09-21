import type { Container } from 'pixi.js';

import type { LevelView } from './gameplay';

export interface LevelTransitionOptions {
  outgoing: LevelView;
  incoming: Container;
  onComplete: () => void;
}

export interface LevelTransition {
  /** Settle on the incoming level immediately, including after an orientation change. */
  finish(): void;
  /** Disconnect animation writes without advancing gameplay. */
  stop(): void;
}
