import type { ChipDirection } from './chip';
import type { ChipColor, RoutePoint } from './level';
import type { CellPosition } from './level-model';

/** Snapshot a resolved match before model changes remove its artwork. */
export interface BoardMatch {
  status: 'clear' | 'reject';
  color: ChipColor;
  start: RoutePoint;
  landing: RoutePoint;
  direction: ChipDirection;
  chain: readonly CellPosition[];
}
export interface ChipJumpOptions {
  landing: RoutePoint;
  direction?: ChipDirection;
  duration: number;
  onComplete: () => void;
}
export type BoardMatchHandler = (match: BoardMatch) => void;
