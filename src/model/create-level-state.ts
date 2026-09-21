import type { LevelConfig } from '#types/level';
import type { LevelState } from '#types/level-model';

/** Create independent mutable state from the authored level configuration. */
export function createLevelState(config: LevelConfig): LevelState {
  const { board, distributor, conveyor } = config.level;
  const { hand } = config;
  const socketCount = conveyor.carrier.sockets;

  // Copy chips only onto playable cells; holes remain empty.
  const cells = board.cells.map((row) => [...row]);
  const chips = board.chips.map((row, rowIndex) =>
    row.map((chip, columnIndex) => {
      if (chip == null || cells[rowIndex]?.[columnIndex] !== 1) {
        return null;
      }
      return { ...chip };
    }),
  );

  const controls = Array.from(
    { length: hand.slots },
    (_, controlIndex) => hand.initialChips[controlIndex]?.color ?? null,
  );
  const queue = distributor.chips.slice(0, distributor.capacity).map((chip) => chip.color);

  return {
    cells,
    board: chips,
    controls,
    queue,
    sockets: Array(socketCount).fill(null),
    // Each socket needs its own crossing history, never a shared Set.
    consumedHits: Array.from({ length: socketCount }, () => new Set<string>()),
    status: 'playing',
  };
}
