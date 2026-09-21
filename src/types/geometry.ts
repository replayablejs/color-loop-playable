import type { RoutePoint } from './level';
import type { ConveyorHit } from './level-model';

/** Grid dimensions include empty cells. All math uses the unscaled level space. */
export interface BoardGeometry {
  rows: number;
  columns: number;
  /** Center-to-center distance: chip size plus the gap. */
  spacing: number;
}
export interface RouteSegment {
  start: RoutePoint;
  end: RoutePoint;
  /** Cumulative positive distance at this piece's END, measured from trace()'s start. */
  distance: number;
}
export interface RouteSampler {
  readonly length: number;
  /** Local [x, y] at a lap distance; negative and multi-lap distances wrap. */
  position(distance: number): RoutePoint;
  /** Signed travel: positive follows the authored points, negative reverses them. */
  trace(distance: number, travel: number): RouteSegment[];
}
/** A socket alignment with one row or column; equal-progress crossings are simultaneous. */
export interface BoardCrossing {
  axis: 'row' | 'column';
  /** Zero-based row or column index, as selected by axis. */
  index: number;
  point: RoutePoint;
  /** Fraction of the supplied straight movement segment. */
  progress: number;
}
/** Nearest occupied cell in one direction from a crossing point. */
export interface RayHit extends ConveyorHit {
  direction: 'right' | 'down' | 'left' | 'up';
  /** Positive local distance from the socket to this chip center. */
  distance: number;
  point: RoutePoint;
}
/** Axis-aligned local bounds: left <= right, top <= bottom (y grows down). */
export interface RectangleBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}
/** First contact with a rectangle, including a start already inside. */
export interface SegmentEntry {
  point: RoutePoint;
  progress: number;
}
/** Precomputed straight edge of a closed conveyor route. */
export interface RouteEdge {
  start: RoutePoint;
  end: RoutePoint;
  length: number;
  /** Cumulative distance from the first route point to this edge's start. */
  startDistance: number;
}

/** Fractions of a movement for which a coordinate remains within bounds. */
export interface ProgressInterval {
  enter: number;
  exit: number;
}
