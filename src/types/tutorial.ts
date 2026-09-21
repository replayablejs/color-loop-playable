import type { Container, PointData } from 'pixi.js';

export interface TutorialTarget {
  readonly position: PointData;
  readonly size: number;
}

export interface Tutorial {
  readonly container: Container;
  restart(): void;
  consume(): void;
  destroy(): void;
}
