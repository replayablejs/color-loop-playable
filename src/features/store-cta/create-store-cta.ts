import { createButton, createNineSliceSprite, createText } from '@replayablejs/pixi';
import { playable } from '@replayablejs/runtime';
import { Container, Rectangle, type FederatedPointerEvent } from 'pixi.js';

import { fonts, sprites } from '#registries';
import type { View } from '#types/view';

import { storeCtaSize } from '../../config/store-cta';

/** One shared button: artwork and localized text always scale together. */
export function createStoreCta(): View {
  const container = new Container({ label: 'store-cta-artwork' });
  const { width, height } = storeCtaSize;

  // The tiny source preserves its corners; only the middle and edges stretch.
  const background = createNineSliceSprite({
    texture: sprites['cta-button'],
    // Match the label, bounds, and hit area's top-left coordinate system.
    anchor: { x: 0, y: 0 },
    leftWidth: 28,
    rightWidth: 28,
    topHeight: 24,
    bottomHeight: 24,
    width,
    height,
  });

  const label = createText({
    text: playable.localization.translate('playNow'),
    style: {
      fontFamily: fonts['Archivo Black'],
      fontSize: 28,
      fill: 0xffffff,
      stroke: { color: 0x397719, width: 2, join: 'round' },
      dropShadow: {
        color: 0x244e10,
        alpha: 0.65,
        angle: Math.PI / 2,
        distance: 2,
        blur: 1,
      },
    },
  });
  // Center on the button face, excluding the downward bevel and shadow.
  label.position.set(width / 2, height / 2 - 5);
  label.scale.set(Math.min(1, (width - 40) / label.width));

  container.addChild(background, label);
  container.boundsArea = new Rectangle(0, 0, width, height);
  const button = createButton({ content: container, onActivate: openStore });
  button.container.label = 'store-cta';
  // Isolate the whole pointer gesture from scene-level interactions.
  button.container.on('pointerdown', stopPropagation);
  button.container.on('pointerup', stopPropagation);
  button.container.on('pointerupoutside', stopPropagation);

  return { container: button.container, destroy: button.destroy };

  function openStore(): void {
    playable.openStore();
  }

  function stopPropagation(event: FederatedPointerEvent): void {
    event.stopPropagation();
  }
}
