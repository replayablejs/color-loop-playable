import type { ChipColor } from '#types/level';
import type { LevelState } from '#types/level-model';

/** Remove exhausted colors, then fill empty controls from the remaining board. */
export function refreshColors(state: LevelState): void {
  const available = getBoardColors(state);
  state.queue = state.queue.filter((color) => available.includes(color));

  state.sockets.forEach((chip, index) => {
    if (chip && !available.includes(chip.color)) {
      state.sockets[index] = null;
      state.consumedHits[index].clear();
    }
  });
  if (available.length === 0) {
    // Keep the last control chips visible through the group's exit animation.
    return;
  }

  state.controls.forEach((color, index) => {
    if (color && !available.includes(color)) {
      state.controls[index] = null;
    }
  });

  refillControls(state.controls, available);
}

function getBoardColors(state: LevelState): ChipColor[] {
  const colors = new Set<ChipColor>();
  for (const row of state.board) {
    for (const chip of row) {
      if (chip !== null) {
        colors.add(chip.color);
      }
    }
  }
  return [...colors];
}

/** Offer missing colors first; repeat the first remaining color when all are present. */
function refillControls(controls: (ChipColor | null)[], available: readonly ChipColor[]): void {
  controls.forEach((color, index) => {
    if (color !== null) {
      return;
    }
    const missingColor = available.find((candidate) => !controls.includes(candidate));
    controls[index] = missingColor ?? available[0] ?? null;
  });
}
