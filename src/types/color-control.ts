import type { Container } from 'pixi.js';

import type { ChipColor } from './level';
import type { TutorialTarget } from './tutorial';

export interface ColorControl {
  readonly container: Container;
  /** Null clears the chip and disables input, preserving its tray. */
  setColor(color: ChipColor | null): void;
  playFeed(): void;
  finishFeed(): void;
  playEntrance(): void;
  playReject(): void;
}

/** A fixed set of slots that reflows when screen orientation changes. */
export interface ColorControls {
  readonly container: Container;
  playFeed(index: number): void;
  playReject(index: number): void;
  show(): void;
  hide: (onComplete: () => void) => void;
  getTutorialTarget: () => TutorialTarget | undefined;
  refresh(colors: readonly (ChipColor | null)[]): void;
  resize(): void;
}
