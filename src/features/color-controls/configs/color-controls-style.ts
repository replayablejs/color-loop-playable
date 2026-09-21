import { levelStyle } from '../../../config/level';

// Controls use larger chips; their tray and spacing follow that size.
const chipSize = levelStyle.chipSize * 1.8;
const trayPadding = chipSize / 6;
const traySize = chipSize + trayPadding * 2;
const trayGap = chipSize / 9;

export const colorControlsStyle = {
  chipSize,
  traySize,
  trayRadius: traySize / 4,
  spacing: traySize + trayGap,
  chipCenterX: traySize / 2,
  // Raise the artwork slightly to balance its downward shadow.
  chipCenterY: traySize / 2 - chipSize / 72,
};
