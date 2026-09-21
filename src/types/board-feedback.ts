import type { BoardTile } from './gameplay';

export interface BoardFeedback {
  readonly animating: boolean;
  anticipate(chain: readonly BoardTile[]): void;
  reject(chain: readonly BoardTile[]): void;
  stop(tile: BoardTile): void;
  destroy: () => void;
}
export type BoardFeedbackKind = 'anticipation' | 'rejection';
export interface BoardChainOptions {
  beforeJump: (tile: BoardTile) => void;
  onComplete: () => void;
}
