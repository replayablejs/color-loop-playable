import type { RouteEdge, RouteSampler, RouteSegment } from '#types/geometry';
import type { RoutePoint } from '#types/level';

/**
 * Treat a closed conveyor as a measuring tape laid along its authored points.
 * All distances are local artwork units, before the level's responsive scale.
 * Positive travel follows point order; negative travel goes the other way.
 *
 * position() locates a socket. trace() describes the path it actually travelled
 * between frames, split at corners so collision checks cannot cut across them.
 */
export function createRouteSampler(points: readonly RoutePoint[]): RouteSampler {
  const edges = createEdges(points);
  const length = edges.reduce((total, edge) => total + edge.length, 0);
  if (!Number.isFinite(length) || length === 0) {
    throw new Error('A conveyor route needs at least two distinct finite points.');
  }

  return { length, position, trace };

  /** Wrap any lap distance onto this lap, then interpolate along its edge. */
  function position(distance: number): RoutePoint {
    // JS remainder can be negative. The second remainder makes -5 on a
    // 40-unit route become 35, which also handles counterclockwise travel.
    const lapDistance = ((distance % length) + length) % length;

    for (const edge of edges) {
      const distanceAlongEdge = lapDistance - edge.startDistance;
      if (distanceAlongEdge > edge.length) {
        continue;
      }

      // 0 is this edge's start; 1 is its end. Interpolate x and y independently.
      const progress = distanceAlongEdge / edge.length;
      const [startX, startY] = edge.start;
      const [endX, endY] = edge.end;
      return [startX + (endX - startX) * progress, startY + (endY - startY) * progress];
    }

    // A rounding error at the end of a lap resolves to the route's start.
    return edges[0].start;
  }

  /**
   * Keep distances unwrapped until all crossed corners have been found.
   * Example: moving from 35 to 55 on a 40-unit lap crosses the lap boundary at
   * 40. Wrapping first would turn this into 35 to 15 and lose that information.
   * Multiple laps and reversed travel use the same calculation.
   */
  function trace(startDistance: number, travel: number): RouteSegment[] {
    if (!Number.isFinite(startDistance) || !Number.isFinite(travel)) {
      throw new Error('Route distance and travel must be finite.');
    }
    if (travel === 0) {
      return [];
    }

    const endDistance = startDistance + travel;
    const stops = getCrossedCorners(startDistance, endDistance);
    stops.push(endDistance);

    const segments: RouteSegment[] = [];
    let segmentStart = startDistance;
    for (const segmentEnd of stops) {
      segments.push({
        start: position(segmentStart),
        end: position(segmentEnd),
        // Cumulative distance, NOT this piece's length. This lets callers
        // determine how much of the frame happened before a feed or match.
        distance: Math.abs(segmentEnd - startDistance),
      });
      segmentStart = segmentEnd;
    }
    return segments;
  }

  /** List interior corner distances in the order the socket encounters them. */
  function getCrossedCorners(startDistance: number, endDistance: number): number[] {
    const lowerDistance = Math.min(startDistance, endDistance);
    const upperDistance = Math.max(startDistance, endDistance);
    const firstLap = Math.floor(lowerDistance / length);
    const lastLap = Math.floor(upperDistance / length);
    const corners: number[] = [];

    for (let lap = firstLap; lap <= lastLap; lap++) {
      const lapStart = lap * length;
      for (const edge of edges) {
        const cornerDistance = lapStart + edge.startDistance;
        // Endpoints are already represented by the movement's start/end.
        // Excluding them here avoids zero-length movement pieces.
        if (cornerDistance > lowerDistance && cornerDistance < upperDistance) {
          corners.push(cornerDistance);
        }
      }
    }

    if (endDistance < startDistance) {
      corners.reverse();
    }
    return corners;
  }
}

/** Precompute each edge's length and its distance from the start of the lap. */
function createEdges(points: readonly RoutePoint[]): RouteEdge[] {
  const edges: RouteEdge[] = [];
  let startDistance = 0;

  for (const [index, start] of points.entries()) {
    // The last point connects back to the first: this is always a closed route.
    const end = points[(index + 1) % points.length];
    const horizontalDistance = end[0] - start[0];
    const verticalDistance = end[1] - start[1];
    const length = Math.hypot(horizontalDistance, verticalDistance);

    // Authored routes may repeat the first point at the end. Such an edge has
    // no length, contributes no travel, and must not cause division by zero.
    if (length === 0) {
      continue;
    }
    edges.push({ start, end, length, startDistance });
    startDistance += length;
  }
  return edges;
}
