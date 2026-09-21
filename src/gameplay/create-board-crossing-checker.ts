import type { BoardCrossingChecker, BoardCrossingCheckerOptions } from '#types/gameplay';
import type { BoardCrossing } from '#types/geometry';
import type { RoutePoint } from '#types/level';

import { levelStyle } from '../config/level';
import { getBoardCrossings } from '../math/get-board-crossings';
import { getBoardRayHits } from '../math/get-board-ray-hits';

// A row and column reached at effectively the same progress form one check.
const simultaneousCrossingTolerance = 1e-6;

/** Translate geometric crossings into ordered model match attempts. */
export function createBoardCrossingChecker({
  config,
  model,
  onMatch,
}: BoardCrossingCheckerOptions): BoardCrossingChecker {
  const grid = {
    rows: config.cells.length,
    columns: Math.max(0, ...config.cells.map((row) => row.length)),
    spacing: levelStyle.chipSize + levelStyle.chipGap,
  };

  return checkCrossings;

  /** Return true when a chain clears; passing a stationary point checks current alignment. */
  function checkCrossings(socketIndex: number, start: RoutePoint, end: RoutePoint): boolean {
    const crossings = getBoardCrossings(grid, start, end);

    for (const group of groupSimultaneousCrossings(crossings)) {
      // Read fresh board state: previous sockets may already have removed chips.
      if (resolveCrossingGroup(socketIndex, group)) {
        // The carried chip was consumed, so it cannot hit anything farther along.
        return true;
      }
    }

    // Retain only hits at the final position. Rays passed during this movement
    // must become eligible again on the next lap, while aligned hits stay consumed.
    const remainingCrossings = getBoardCrossings(grid, end, end);
    return resolveCrossingGroup(socketIndex, remainingCrossings);
  }

  /** Apply one simultaneous group, then give its result coordinates for animation. */
  function resolveCrossingGroup(socketIndex: number, crossings: readonly BoardCrossing[]): boolean {
    const color = model.sockets[socketIndex]?.color;
    const hits = getBoardRayHits(model.board, grid, crossings);
    const result = model.resolveCrossings(socketIndex, hits);

    if (result.status === 'none') {
      return false;
    }

    // Capture the exact crossing point, not the socket's end-of-frame position.
    const hit = hits.find((candidate) => candidate.id === result.hitId)!;
    onMatch?.({
      status: result.status,
      color: color!,
      start: crossings[0].point,
      landing: hit.point,
      direction: hit.direction,
      chain: result.chain,
    });
    return result.status === 'clear';
  }
}

/** Keep travel order while combining row/column rays at the same position. */
function groupSimultaneousCrossings(crossings: readonly BoardCrossing[]): BoardCrossing[][] {
  const groups: BoardCrossing[][] = [];
  for (const crossing of crossings) {
    const previousGroup = groups.at(-1);
    const samePosition =
      previousGroup &&
      Math.abs(crossing.progress - previousGroup[0].progress) < simultaneousCrossingTolerance;

    if (samePosition) {
      previousGroup.push(crossing);
    } else {
      groups.push([crossing]);
    }
  }
  return groups;
}
