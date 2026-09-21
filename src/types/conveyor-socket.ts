import type { Container } from 'pixi.js';

import type { ChipColor } from './level';

export interface ConveyorSocket {
  readonly container: Container;
  /** Null removes the carried chip while preserving the socket marker. */
  setColor(color: ChipColor | null): void;
}
