import { atlases } from '#registries';
import type { ChipIndicator } from '#types/chip';

// Measurements from the original 1088×1081 artwork stay normalized after source resizing.
const sourceWidth = 1088;
const sourceHeight = 1081;
const faceBounds = { left: 57, top: 62, right: 1017, bottom: 942 };
const faceCenterX = (faceBounds.left + faceBounds.right) / 2;
const faceCenterY = (faceBounds.top + faceBounds.bottom) / 2;

/** Ratios keep the same artwork proportions for board chips and larger controls. */
export const tileStyle = {
  heightRatio: sourceHeight / sourceWidth,
  // Both axes use width as the scale reference, preserving the source aspect ratio.
  faceOffsetX: (faceCenterX - sourceWidth / 2) / sourceWidth,
  faceOffsetY: (faceCenterY - sourceHeight / 2) / sourceWidth,
  arrowSize: 0.64,
  dotSize: 0.37,
  shadow: { x: 1 / 30, y: 1 / 15, alpha: 0.2 },
};

// Each direction has its own centered artwork; no runtime rotation is needed.
export const indicatorTextures = {
  up: atlases.chip['arrow-up'],
  right: atlases.chip['arrow-right'],
  down: atlases.chip['arrow-down'],
  left: atlases.chip['arrow-left'],
  dot: atlases.chip.dot,
} satisfies Record<ChipIndicator, string>;
