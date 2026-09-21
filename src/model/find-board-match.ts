import type { ChipColor } from '#types/level';
import type { ConveyorHit, LevelState, MatchResult } from '#types/level-model';

import { findChipChain } from './find-chip-chain';

/**
 * Among same-color crossings, prefer the longest clear chain.
 * Equal lengths keep the earlier crossing; reject only when no chain can clear.
 */
export function findBoardMatch(
  state: Pick<LevelState, 'cells' | 'board'>,
  color: ChipColor,
  hits: readonly ConveyorHit[],
): MatchResult {
  let longestClearMatch: MatchResult | undefined;
  let blockedMatch: MatchResult | undefined;

  for (const hit of hits) {
    if (state.board[hit.row]?.[hit.column]?.color !== color) {
      continue;
    }

    const { chain, blocked } = findChipChain(state.cells, state.board, hit);
    if (blocked) {
      blockedMatch ??= { status: 'reject', chain, hitId: hit.id };
      continue;
    }

    if (chain.length > (longestClearMatch?.chain.length ?? 0)) {
      longestClearMatch = { status: 'clear', chain, hitId: hit.id };
    }
  }

  return longestClearMatch ?? blockedMatch ?? { status: 'none', chain: [] };
}
