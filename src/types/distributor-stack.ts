import type { TweenPlaybackControls } from '@replayablejs/tween';
import type { Container } from 'pixi.js';

import type { ChipColor } from './level';

export interface DistributorStack {
  readonly container: Container;
  takeChip(): Container | undefined;
  setQueue(colors: readonly ChipColor[]): void;
}
export interface DistributorStackChip {
  readonly color: ChipColor;
  readonly container: Container;
  animation?: TweenPlaybackControls;
}
