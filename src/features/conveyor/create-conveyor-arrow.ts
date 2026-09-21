import { Graphics } from 'pixi.js';

import { conveyorStyle } from '../../config/level';
import { palette } from '../../config/palette';

/** A small rounded triangle points right before its route rotation is applied. */
export function createConveyorArrow(): Graphics {
  const arrow = new Graphics({ label: 'conveyor-arrow' });
  const { size, scaleX, scaleY } = conveyorStyle.arrow;
  arrow.roundPoly(0, 0, size * 0.48, 3, size * 0.2, Math.PI / 2).fill(palette.conveyorArrow);
  arrow.scale.set(scaleX, scaleY);
  return arrow;
}
