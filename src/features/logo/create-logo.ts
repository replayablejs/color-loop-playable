import { createSprite } from '@replayablejs/pixi';
import { Container } from 'pixi.js';

import { sprites } from '#registries';

import { palette } from '../../config/palette';
import { createCachedShadow } from '../shadow/create-cached-shadow';

/** Keep the logo's soft cast shadow outside its layout bounds. */
export function createLogo(): Container {
  const container = new Container({ label: 'logo' });
  const artwork = createSprite({ texture: sprites.logo });
  const shadow = createSprite({ texture: sprites.logo });
  const size = artwork.width;

  shadow.tint = palette.shadow;
  shadow.alpha = 0.3;
  shadow.position.set(size * 0.01, size * 0.025);
  const shadowLayer = createCachedShadow(shadow, {
    label: 'logo-shadow',
    strength: size * 0.015,
  });

  container.addChild(artwork);
  // Fit the visible artwork; the decorative shadow must not shrink or shift it.
  container.boundsArea = container.getLocalBounds().rectangle.clone();
  container.addChildAt(shadowLayer, 0);

  return container;
}
