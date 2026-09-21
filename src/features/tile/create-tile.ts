import { createSprite } from '@replayablejs/pixi';
import { Container, type Sprite } from 'pixi.js';

import { atlases } from '#registries';
import type { ChipIndicator } from '#types/chip';
import type { ChipColor } from '#types/level';

import { levelStyle } from '../../config/level';
import { palette } from '../../config/palette';
import { indicatorTextures, tileStyle } from './configs/tile-style';

/** Board chips and color controls share the same layered artwork. */
export function createTile(
  indicator: ChipIndicator,
  size = levelStyle.chipSize,
  color: ChipColor = 'green',
): Container {
  const container = new Container({ label: 'tile' });
  const shadow = createShadow(size);
  const body = createBody(size, palette[color]);
  const symbol = createIndicator(indicator, size);

  container.addChild(shadow, body, symbol);
  return container;
}

function createBody(size: number, tint: number): Sprite {
  const body = createSprite({
    texture: atlases.chip.body,
    anchor: { x: 0.5, y: 0.5 },
  });
  body.width = size;
  body.height = size * tileStyle.heightRatio;
  body.tint = tint;
  return body;
}

function createShadow(size: number): Sprite {
  const shadow = createBody(size, palette.shadow);
  shadow.alpha = tileStyle.shadow.alpha;
  shadow.position.set(size * tileStyle.shadow.x, size * tileStyle.shadow.y);
  return shadow;
}

/** Center the symbol on the flat face, excluding the bevel and cast shadow. */
function createIndicator(indicator: ChipIndicator, size: number): Sprite {
  const symbol = createSprite({
    texture: indicatorTextures[indicator],
  });

  const sizeRatio = indicator === 'dot' ? tileStyle.dotSize : tileStyle.arrowSize;
  symbol.label = 'indicator';
  symbol.width = symbol.height = size * sizeRatio;
  symbol.position.set(size * tileStyle.faceOffsetX, size * tileStyle.faceOffsetY);

  return symbol;
}
