import type { LayoutConfig } from '@replayablejs/pixi';
import { playable } from '@replayablejs/runtime';

/** Authored regions handle placement; contain fitting preserves playfield geometry. */
export function createGameplayLayout(controlCount: number): LayoutConfig {
  const { safeArea: bounds, orientation } = playable.screen;
  const areas =
    orientation === 'portrait'
      ? createPortraitAreas(controlCount)
      : createLandscapeAreas(controlCount);

  return { bounds, debug: false, areas };
}

function createPortraitAreas(controlCount: number): LayoutConfig['areas'] {
  const bounds = playable.screen.safeArea;
  // Wider portrait screens have room to reclaim some space below the logo.
  const tabletAdjustment = Math.max(
    0,
    Math.min(1, (bounds.width / bounds.height - 0.6) / (0.78 - 0.6)),
  );
  const playfieldTop = 0.16 - 0.035 * tabletAdjustment;
  const playfieldBottom = 0.86;
  const controlsWidth = Math.min(0.9, 0.2 * controlCount);

  // Cap the playfield width on tablets, independently of its vertical placement.
  const playfieldWidth = Math.min(0.92, (bounds.height * 0.62) / bounds.width);

  return {
    playfield: {
      bounds: {
        x: (1 - playfieldWidth) / 2,
        y: playfieldTop,
        width: playfieldWidth,
        height: playfieldBottom - playfieldTop,
      },
      scale: 'contain',
    },
    controls: {
      bounds: { x: (1 - controlsWidth) / 2, y: 0.89, width: controlsWidth, height: 0.1 },
      scale: 'contain',
    },
  };
}

function createLandscapeAreas(controlCount: number): LayoutConfig['areas'] {
  const { width, height } = playable.screen.safeArea;
  // Widen the playfield gradually from wide phones (1.8) to tablets (1.25).
  const compactness = Math.max(0, Math.min(1, (1.8 - width / height) / (1.8 - 1.25)));
  const playfieldWidth = 0.48 + 0.06 * compactness;
  const playfieldLeft = (1 - playfieldWidth) / 2;
  const playfieldRight = playfieldLeft + playfieldWidth;
  // Short landscape screens constrain the board by height. Cap each control's
  // width by that same dimension so wide phones do not produce oversized chips.
  const controlsWidth = Math.min(0.1, (height * 0.15) / width);
  // Center the existing control area in the space remaining to the safe-area edge.
  const controlsLeft = playfieldRight + (1 - playfieldRight - controlsWidth) / 2;
  const controlsHeight = Math.min(0.9, 0.2 * controlCount);

  return {
    playfield: {
      // Use the safe-area height with matching top and bottom margins.
      bounds: { x: playfieldLeft, y: 0.02, width: playfieldWidth, height: 0.96 },
      scale: 'contain',
    },
    controls: {
      bounds: {
        x: controlsLeft,
        y: (1 - controlsHeight) / 2,
        width: controlsWidth,
        height: controlsHeight,
      },
      scale: 'contain',
    },
  };
}
