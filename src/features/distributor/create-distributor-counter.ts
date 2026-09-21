import { createText } from '@replayablejs/pixi';
import { Container, Graphics } from 'pixi.js';

import { fonts } from '#registries';

import { palette } from '../../config/palette';
import { distributorStyle } from './configs/distributor-style';

/** Center the label and tab together beneath the tray. */
export function createDistributorCounter(chipCount: number, capacity: number) {
  const container = new Container({ label: 'capacity-counter' });
  const { counter, tray, bevelDepth } = distributorStyle;

  const tab = new Graphics()
    .roundRect(
      -counter.width / 2,
      -counter.height / 2,
      counter.width,
      counter.height,
      counter.radius,
    )
    .fill(palette.trayRim);

  const label = createText({
    text: `${chipCount}/${capacity}`,
    style: {
      fontFamily: fonts['Archivo Black'],
      fontSize: counter.fontSize,
      fill: palette.ink,
    },
  });

  container.y = tray.height + bevelDepth + counter.gap + counter.height / 2;
  container.addChild(tab, label);
  return {
    container,
    setCount(count: number): void {
      label.text = `${count}/${capacity}`;
    },
  };
}
