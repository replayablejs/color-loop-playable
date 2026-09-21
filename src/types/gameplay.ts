import type { Container } from 'pixi.js';

import type { BoardMatchHandler } from './board-jump';
import type { ChipDirection } from './chip';
import type { ConveyorArrowTransform } from './conveyor-arrow';
import type { DistributorThrowEvents } from './conveyor-feed';
import type { ChipColor, ChipConfig, LevelConfig, RoutePoint } from './level';
import type { CarriedChip, CellPosition, LevelModel, LevelStatus } from './level-model';
import type { View } from './view';

export interface GameplayView extends View {
  /** Start the playable's level sequence. */
  start(): void;
}
export interface LevelOptions {
  config: LevelConfig;
  tutorial: boolean;
  onFinish: (status: LevelStatus) => void;
  /** Report only selections successfully queued in the distributor. */
  onMoveAccepted: () => void;
}
export interface LevelView extends View {
  /** Animate controls out before the transition moves this level offscreen. */
  hideControls: (onComplete: () => void) => void;
  /** Begin movement and input once this level is fully onscreen. */
  start(): void;
}
export interface StatefulView {
  container: Container;
  refresh(): void;
}
export interface ConveyorView {
  container: Container;
  refresh(socketChips: readonly (CarriedChip | null)[]): void;
  updatePositions: (
    socketPositions: readonly RoutePoint[],
    arrowTransforms: readonly ConveyorArrowTransform[],
  ) => void;
}
export type BoardSnapshot = readonly (readonly (Readonly<ChipConfig> | null)[])[];

export interface BoardView {
  container: Container;
  refresh(chips: BoardSnapshot): void;
  /** Mount above the conveyor; resting artwork stays in container beneath it. */
  readonly animationLayer: Container;
  readonly idle: boolean;
  playMatch: BoardMatchHandler;
}
export interface BoardOptions {
  config: LevelConfig['level']['board'];
  onIdle: () => void;
}
export interface PlayfieldOptions {
  config: LevelConfig['level'];
  onIdle: () => void;
}
export interface PlayfieldSnapshot {
  sockets: readonly (CarriedChip | null)[];
  board: BoardSnapshot;
  distributorQueue: readonly ChipColor[];
}
export interface PlayfieldView {
  container: Container;
  refresh(snapshot: PlayfieldSnapshot): void;
  /** Board reactions and distributor throws have finished; belt travel may continue. */
  readonly idle: boolean;
  playMatch: BoardMatchHandler;
  readonly distributorThrow: DistributorThrowEvents;
  updateConveyorPositions: (
    socketPositions: readonly RoutePoint[],
    arrowTransforms: readonly ConveyorArrowTransform[],
  ) => void;
}
export interface ConveyorMovement {
  /** Advance simulation and update conveyor positions. */
  update(deltaSeconds: number): void;
  /** Explicitly end feeding and matching while retaining visual movement. */
  complete(): void;
}
export interface ConveyorMovementOptions {
  config: LevelConfig;
  model: LevelModel;
  throwEvents: DistributorThrowEvents;
  onMatch?: BoardMatchHandler;
  onPositionsChange: (
    socketPositions: readonly RoutePoint[],
    arrowTransforms: readonly ConveyorArrowTransform[],
  ) => void;
}
export interface BoardTile extends CellPosition {
  container: Container;
  direction?: ChipDirection;
}
export interface DistributorCounter {
  container: Container;
  setCount(count: number): void;
}

export interface BoardCrossingCheckerOptions {
  config: LevelConfig['level']['board'];
  model: LevelModel;
  onMatch?: BoardMatchHandler;
}

/** Check one straight movement piece; return whether a board chain was cleared. */
export type BoardCrossingChecker = (
  socketIndex: number,
  start: RoutePoint,
  end: RoutePoint,
) => boolean;
