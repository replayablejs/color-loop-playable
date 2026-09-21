import type { Container } from 'pixi.js';

import type { RouteSampler } from './geometry';
import type { ChipColor, RoutePoint } from './level';
import type { LevelModel } from './level-model';

export interface DistributorThrowEvents {
  start(landing: RoutePoint): void;
  update(progress: number): void;
  finish(distributorQueue: readonly ChipColor[]): void;
}
export interface PendingThrow {
  socketIndex: number;
  color: ChipColor;
  /** Positive route distance left before the reserved socket reaches landing. */
  remainingDistance: number;
}
export interface ConveyorFeederOptions {
  sampler: RouteSampler;
  route: readonly RoutePoint[];
  speed: number;
  model: LevelModel;
  throwEvents: DistributorThrowEvents;
}
export interface ConveyorFeeder {
  /** Return signed travel before landing, or undefined if the socket is still empty. */
  advance(socketIndex: number, startDistance: number, travel: number): number | undefined;
  cancelThrowIfInvalid(): void;
  /** Cancel any active throw without loading its socket. */
  cancelThrow(): void;
}
export interface DistributorView {
  container: Container;
  refresh(queue: readonly ChipColor[]): void;
  takeChip(): Container | undefined;
  finishFeed(queue: readonly ChipColor[]): void;
}
export interface DistributorThrow {
  update(progress: number): void;
  destroy(): void;
}
