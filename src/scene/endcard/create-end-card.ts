import { createLayout } from '@replayablejs/pixi';
import { playable } from '@replayablejs/runtime';
import { Container, Rectangle, type FederatedPointerEvent } from 'pixi.js';

import type { EndCard } from '#types/end-card';

import { createStoreCta } from '../../features/store-cta/create-store-cta';
import { createInterfaceLayout } from '../interface/configs/interface-layout';

/** Keep the finished game visible beneath a network-aware input shield. */
export function createEndCard(): EndCard {
  const container = new Container({
    label: 'endcard',
    visible: false,
    eventMode: 'static',
    hitArea: new Rectangle(0, 0, playable.screen.frame.width, playable.screen.frame.height),
  });

  const { endCard, controls } = playable.config;
  const allowsBackdropTap = endCard.interaction === 'full-screen';

  // CTA-only networks need a button even when their gameplay CTA is disabled.
  const needsCta = endCard.interaction === 'cta-only' || controls.persistentCta;

  const layout = createLayout(createInterfaceLayout());
  const cta = needsCta ? createStoreCta() : undefined;

  container.addChild(layout.container);

  if (cta) {
    layout.attach('cta', cta.container);
  }

  // Every network blocks input from reaching the finished game.
  container.on('pointerdown', stopPropagation);
  container.on('pointerup', stopPropagation);
  container.on('pointertap', allowsBackdropTap ? openStore : stopPropagation);

  const removeResize = playable.on('resize', resize);

  return { container, show, destroy };

  function show(): void {
    container.visible = true;
  }

  function resize(): void {
    const { width, height } = playable.screen.frame;
    container.hitArea = new Rectangle(0, 0, width, height);

    layout.update(createInterfaceLayout());
  }

  function destroy(): void {
    removeResize();

    layout.destroy();
    cta?.destroy();
    container.destroy();
  }
}

function stopPropagation(event: FederatedPointerEvent): void {
  event.stopPropagation();
}

function openStore(event: FederatedPointerEvent): void {
  event.stopPropagation();

  if (event.isPrimary && event.button === 0) {
    playable.openStore();
  }
}
