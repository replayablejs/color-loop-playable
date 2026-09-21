import type { ChipColor, ChipConfig, LevelConfig } from './level';

export interface CellPosition {
  readonly row: number;
  readonly column: number;
}
/** Ordered nearest-first by the movement layer; id identifies a directional crossing. */
export interface ConveyorHit extends CellPosition {
  readonly id: string;
}
export interface MatchResult {
  readonly status: 'none' | 'reject' | 'clear';
  readonly chain: readonly CellPosition[];
  readonly hitId?: string;
}
export interface CarriedChip {
  readonly color: ChipColor;
  /** Accumulated local-route distance since this chip entered its socket. */
  readonly distance: number;
}
export type LevelOutcome = 'won' | 'lost';
export type LevelStatus = 'playing' | LevelOutcome;

export interface LevelModelOptions {
  config: LevelConfig;
  onOutcome: (outcome: LevelOutcome) => void;
}

/** Logical results are immediate; the scene waits for visuals before changing levels. */
export interface LevelModel {
  /** Changes when chips, controls, or the queue change; travel distance does not count. */
  readonly revision: number;
  readonly board: readonly (readonly (Readonly<ChipConfig> | null)[])[];
  readonly controls: readonly (ChipColor | null)[];
  readonly distributorQueue: readonly ChipColor[];
  readonly sockets: readonly (CarriedChip | null)[];
  readonly status: LevelStatus;
  queueForDistributor(controlIndex: number): boolean;
  loadSocket(socketIndex: number): boolean;
  /** Supply every current hit (or [] after leaving), so crossing history can reset. */
  resolveCrossings(socketIndex: number, hits: readonly ConveyorHit[]): MatchResult;
  /** Add a positive route-distance increment after loading, regardless of travel direction. */
  addTravelDistance(socketIndex: number, distance: number): void;
  /**
   * After feeds and matches, lose only if every socket is occupied and each chip
   * has travelled at least `routeLength` local units. A final board clear wins first.
   */
  checkLoss(routeLength: number): void;
}

/** Mutable state owned exclusively by the game model. */
export interface LevelState {
  cells: number[][];
  board: (ChipConfig | null)[][];
  controls: (ChipColor | null)[];
  queue: ChipColor[];
  sockets: (CarriedChip | null)[];
  consumedHits: Set<string>[];
  status: LevelStatus;
}
