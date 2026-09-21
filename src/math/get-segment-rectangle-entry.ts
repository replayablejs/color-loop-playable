import type { ProgressInterval, RectangleBounds, SegmentEntry } from '#types/geometry';
import type { RoutePoint } from '#types/level';

/**
 * Find the first point at which a moving socket enters a rectangular feed zone.
 * Checking only the frame's endpoint could miss a socket that passed right through.
 * All points and bounds must use the same local coordinate system.
 *
 * Progress is 0 at start and 1 at end. Starting inside returns 0; touching an edge
 * counts as entry. No intersection returns undefined. The caller can use the
 * remaining fraction (1 - progress) to record travel AFTER a chip is loaded.
 */
export function getSegmentRectangleEntry(
  start: RoutePoint,
  end: RoutePoint,
  bounds: RectangleBounds,
): SegmentEntry | undefined {
  const horizontal = getAxisInterval(start[0], end[0], bounds.left, bounds.right);
  const vertical = getAxisInterval(start[1], end[1], bounds.top, bounds.bottom);
  if (!horizontal || !vertical) {
    return undefined;
  }

  // The socket is inside the rectangle only while BOTH coordinates are inside.
  // Intersect the two intervals and limit the result to this movement's [0, 1].
  const entryProgress = Math.max(0, horizontal.enter, vertical.enter);
  const exitProgress = Math.min(1, horizontal.exit, vertical.exit);
  if (entryProgress > exitProgress) {
    return undefined;
  }

  const x = start[0] + (end[0] - start[0]) * entryProgress;
  const y = start[1] + (end[1] - start[1]) * entryProgress;
  return { progress: entryProgress, point: [x, y] };
}

/** Find the progress interval during which one coordinate lies inside its bounds. */
function getAxisInterval(
  start: number,
  end: number,
  minimum: number,
  maximum: number,
): ProgressInterval | undefined {
  const movement = end - start;
  if (movement === 0) {
    if (start < minimum || start > maximum) {
      return undefined;
    }
    // This coordinate stays inside for the entire segment; it adds no restriction.
    return { enter: 0, exit: 1 };
  }

  // Solve start + movement * progress = boundary for both sides.
  const minimumProgress = (minimum - start) / movement;
  const maximumProgress = (maximum - start) / movement;
  // Reversed movement reaches the maximum boundary first, hence min/max here.
  return {
    enter: Math.min(minimumProgress, maximumProgress),
    exit: Math.max(minimumProgress, maximumProgress),
  };
}
