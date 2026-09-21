import { levelStyle } from '../../../config/level';

const chipSize = levelStyle.chipSize;

// Preserve the shallow artwork proportions while scaling with the chip.
export const distributorStyle = {
  tray: {
    width: chipSize * 1.45,
    height: chipSize * 1.4,
    radius: chipSize * 0.3,
  },
  inset: {
    width: chipSize * 1.15,
    height: chipSize * 1.125,
    top: chipSize * 0.125,
    radius: chipSize * 0.2,
  },
  surface: {
    width: chipSize * 1.05,
    height: chipSize * 0.925,
    top: chipSize * 0.275,
    radius: chipSize * 0.15,
  },
  bevelDepth: chipSize * 0.15,
  shadow: {
    x: chipSize * 0.025,
    y: chipSize * 0.2,
    blur: chipSize * 0.1,
    alpha: 0.3,
  },
  stack: { bottomY: chipSize * 0.7, step: chipSize * 0.2 },
  counter: {
    width: chipSize * 1.2,
    height: chipSize * 0.6,
    gap: chipSize * 0.1,
    radius: chipSize * 0.175,
    fontSize: chipSize * 0.45,
  },
};
