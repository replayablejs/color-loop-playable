import type { Container } from 'pixi.js';

export interface View {
  readonly container: Container;
  destroy(): void;
}
