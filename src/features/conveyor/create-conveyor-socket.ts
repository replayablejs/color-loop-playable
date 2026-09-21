import { Container, Graphics } from 'pixi.js';

import type { ConveyorSocket } from '#types/conveyor-socket';
import type { ChipColor } from '#types/level';

import { conveyorStyle, levelStyle } from '../../config/level';
import { palette } from '../../config/palette';
import { createTile } from '../tile/create-tile';

/** Keep the socket marker and its carried chip together as they travel. */
export function createConveyorSocket(): ConveyorSocket {
  const container = new Container({ label: 'socket' });
  const { size, radius } = conveyorStyle.socket;

  const marker = new Graphics()
    .roundRect(-size / 2, -size / 2, size, size, radius)
    .fill(palette.slot);
  let chip: Container | undefined;
  let color: ChipColor | null = null;

  container.addChild(marker);

  return { container, setColor };

  /** Replace only the carried artwork; an empty socket keeps its marker. */
  function setColor(nextColor: ChipColor | null): void {
    if (color === nextColor) {
      return;
    }
    color = nextColor;
    chip?.destroy({ children: true });
    chip = undefined;

    if (color !== null) {
      chip = createTile('dot', levelStyle.chipSize, color);
      container.addChild(chip);
    }
  }
}
