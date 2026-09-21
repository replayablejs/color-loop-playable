import type { ReplayableScreenInput } from '@replayablejs/config';

const portraitRatio = { min: 0.44, max: 0.76 };

export default {
  orientations: {
    portrait: {
      enabled: true,
      width: 700,
      height: 1400,
      ratio: portraitRatio,
    },
    landscape: {
      enabled: true,
      width: 1400,
      height: 700,
      // Rotating swaps width and height, so the limits invert and exchange places.
      ratio: { min: 1 / portraitRatio.max, max: 1 / portraitRatio.min },
    },
  },
  resolution: {
    pixelRatio: { min: 1, max: 2 },
    renderScale: { minimal: 0.55, reduced: 0.65, balanced: 0.85, full: 1 },
  },
} satisfies ReplayableScreenInput;
