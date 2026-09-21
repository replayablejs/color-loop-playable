import { Container, Graphics } from 'pixi.js';

import type { RoutePoint } from '#types/level';

import { conveyorStyle } from '../../config/level';
import { palette } from '../../config/palette';
import { createCachedShadow } from '../shadow/create-cached-shadow';

/** Layer the belt artwork around one route; its shadow does not affect fitting. */
export function createConveyorBelt(route: readonly RoutePoint[]): Container {
  const container = new Container({ label: 'belt' });
  const { width, bevel, highlight } = conveyorStyle;
  const shadow = createShadow(route);

  const edge = drawRoute(route, palette.trackShadow, width);
  edge.y = bevel;

  const rim = drawRoute(route, palette.trackHighlight, width);

  const surface = drawRoute(route, palette.track, width - highlight);
  surface.y = highlight;

  container.addChild(edge, rim, surface);
  // Capture the visible belt bounds before adding its decorative shadow.
  container.boundsArea = container.getLocalBounds().rectangle.clone();
  container.addChildAt(shadow, 0);
  return container;
}

function createShadow(route: readonly RoutePoint[]): Container {
  const { width, highlight, shadow } = conveyorStyle;
  const artwork = drawRoute(route, palette.shadow, width + highlight);
  artwork.position.set(shadow.x, shadow.y);
  artwork.alpha = shadow.alpha;
  return createCachedShadow(artwork, {
    label: 'belt-shadow',
    strength: shadow.blur,
  });
}

/** Stroke the same closed geometry for every visual layer. */
function drawRoute(route: readonly RoutePoint[], color: number, width: number): Graphics {
  return new Graphics()
    .poly(route.flat(), true)
    .stroke({ color, width, join: 'round', cap: 'round' });
}
