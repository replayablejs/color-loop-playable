import { BlurFilter, Container } from 'pixi.js';

import type { CachedShadowOptions } from '#types/shadow';

/** Cache static shadow artwork with room for its full blur. Owns the supplied artwork. */
export function createCachedShadow(
  artwork: Container,
  { label, strength, quality = 4 }: CachedShadowOptions,
): Container {
  const container = new Container({ label });
  const blur = new BlurFilter({ strength, quality, kernelSize: 5 });

  // Cached filters must not be clipped to the screen's viewport.
  blur.clipToViewport = false;
  // Cover the five-sample blur's multi-pass reach, plus a transparent border.
  blur.padding = Math.ceil(strength * 4) + 2;
  artwork.filters = [blur];

  // Measure the child before the wrapper: measuring the wrapper here would
  // cache unpadded bounds that assigning boundsArea does not invalidate.
  artwork.updateLocalTransform();
  const bounds = artwork.getLocalBounds().clone();
  bounds.applyMatrix(artwork.localTransform);
  container.boundsArea = bounds.rectangle.clone().pad(blur.padding);
  container.addChild(artwork);
  container.cacheAsTexture(true);

  return container;
}
