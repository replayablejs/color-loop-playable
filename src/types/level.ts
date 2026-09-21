import type { ChipDirection } from './chip';

export type ChipColor = 'red' | 'green' | 'blue' | 'orange' | 'purple' | 'yellow';
export interface ChipConfig {
  color: ChipColor;
  direction?: ChipDirection;
}
export type RoutePoint = readonly [number, number];

/** Authored level data is independent of Pixi and the runtime. */
export interface LevelConfig {
  level: {
    board: {
      cells: readonly (readonly number[])[];
      chips: readonly (readonly (ChipConfig | null)[])[];
    };
    conveyor: {
      shape: readonly RoutePoint[];
      scale: number;
      carrier: { sockets: number; speed: number; direction: 'clockwise' | 'counterclockwise' };
    };
    distributor: { capacity: number; chips: readonly ChipConfig[] };
  };
  hand: { slots: number; initialChips: readonly ChipConfig[] };
}
export interface GameConfig {
  levels: readonly LevelConfig[];
}
