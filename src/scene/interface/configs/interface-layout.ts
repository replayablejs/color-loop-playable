import type { LayoutAreaConfig, LayoutBounds, LayoutConfig } from '@replayablejs/pixi';
import { playable } from '@replayablejs/runtime';

import { storeCtaSize } from '../../../config/store-cta';

// Paired with the 512px processed sprite for 2x displays.
const maxLogoSize = 256;
// Trimmed logo source dimensions; keep its layout area as tight as the artwork.
const logoAspectRatio = 1467 / 854;

export function createInterfaceLayout(): LayoutConfig {
  const { safeArea: bounds, orientation } = playable.screen;
  const areas = orientation === 'portrait' ? createPortraitAreas() : createLandscapeAreas();

  return {
    bounds,
    debug: false,
    areas,
  };
}

function createPortraitAreas(): LayoutConfig['areas'] {
  const logo = createLogoArea({ x: 0, y: 0, width: 0.44, height: 0.18 });
  const { width, height } = playable.screen.safeArea;
  const ctaWidth = logo.bounds.width * 1.3;
  const ctaHeight = (ctaWidth * width * (storeCtaSize.height / storeCtaSize.width)) / height;

  return {
    logo,
    cta: {
      bounds: { x: 1 - ctaWidth, y: 0.02, width: ctaWidth, height: ctaHeight },
      align: 'top-right',
      scale: 'contain',
    },
  };
}

function createLandscapeAreas(): LayoutConfig['areas'] {
  const { width, height } = playable.screen.safeArea;
  // Short landscape viewports need phone sizing, including less-wide screens like the SE.
  const compactLandscape = height <= 500;
  const brandingScale = compactLandscape ? 1.2 : 1;
  const logo = createLogoArea({
    x: 0,
    y: 0.01,
    width: 0.2,
    height: 0.25 * brandingScale,
  });

  // Keep the SE's CTA-to-logo proportion on every landscape viewport.
  const ctaWidth = logo.bounds.width * 1.3;
  const ctaHeight = (ctaWidth * width * (storeCtaSize.height / storeCtaSize.width)) / height;

  return {
    logo,
    cta: {
      bounds: { x: 0, y: 1 - ctaHeight, width: ctaWidth, height: ctaHeight },
      align: 'bottom-left',
      scale: 'contain',
    },
  };
}

/** Apply the shared size cap without mixing orientation-specific placement. */
function createLogoArea(region: LayoutBounds): LayoutAreaConfig {
  const bounds = playable.screen.safeArea;
  const size = Math.min(region.width * bounds.width, region.height * bounds.height, maxLogoSize);

  return {
    bounds: {
      ...region,
      width: size / bounds.width,
      height: size / logoAspectRatio / bounds.height,
    },
    align: 'top-left',
    scale: 'contain',
  };
}
