const chipSize = 40;

/** Local artwork units; responsive layout scales the complete level together. */
export const levelStyle = {
  size: 620,
  chipSize,
  chipGap: chipSize * 0.1,
  // Space below the visible belt, excluding its shadow.
  distributorGap: chipSize * 0.325,
};

export const conveyorStyle = {
  width: chipSize * 1.2,
  bevel: chipSize * 0.175,
  highlight: chipSize * 0.05,
  shadow: {
    x: chipSize * 0.2,
    y: chipSize * 0.4,
    blur: chipSize * 0.225,
    alpha: 0.38,
  },
  socket: { size: chipSize * 0.55, radius: chipSize * 0.15 },
  arrow: {
    size: chipSize * 1.2 * 0.44,
    scaleX: 0.85,
    scaleY: 1.15,
  },
};

/** Resting cells share the chips' size and centered grid placement. */
export const boardCellStyle = {
  size: chipSize,
  radius: chipSize * 0.2,
};
