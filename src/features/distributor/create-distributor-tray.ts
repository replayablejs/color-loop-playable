import { Container, Graphics } from 'pixi.js';

import { palette } from '../../config/palette';
import { createCachedShadow } from '../shadow/create-cached-shadow';
import { distributorStyle } from './configs/distributor-style';

/** Draw the recessed tray and its decorative shadow. */
export function createDistributorTray(): Container {
  const container = new Container({ label: 'tray' });
  const shadow = createTrayShadow();
  const artwork = new Graphics();

  const { tray, inset, surface, bevelDepth } = distributorStyle;

  // The lowered edge and raised rim share the same outer shape.
  artwork
    .roundRect(-tray.width / 2, bevelDepth, tray.width, tray.height, tray.radius)
    .fill(palette.trayEdge);
  artwork.roundRect(-tray.width / 2, 0, tray.width, tray.height, tray.radius).fill(palette.trayRim);

  // A dark recess surrounds the shallower inner surface.
  artwork
    .roundRect(-inset.width / 2, inset.top, inset.width, inset.height, inset.radius)
    .fill(palette.trayInset);
  artwork
    .roundRect(-surface.width / 2, surface.top, surface.width, surface.height, surface.radius)
    .fill(palette.trayInside);

  container.addChild(shadow, artwork);
  return container;
}

function createTrayShadow(): Container {
  const { tray, shadow: style } = distributorStyle;
  const shadow = new Graphics()
    .roundRect(-tray.width / 2, 0, tray.width, tray.height, tray.radius)
    .fill({ color: palette.shadow, alpha: style.alpha });
  shadow.position.set(style.x, style.y);
  return createCachedShadow(shadow, {
    label: 'tray-shadow',
    strength: style.blur,
    quality: 3,
  });
}
