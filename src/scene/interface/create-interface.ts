import { createLayout } from '@replayablejs/pixi';
import { playable } from '@replayablejs/runtime';
import { Container } from 'pixi.js';

import type { View } from '#types/view';

import { createLogo } from '../../features/logo/create-logo';
import { createPersistentCta } from '../../features/persistent-cta/create-persistent-cta';
import { createInterfaceLayout } from './configs/interface-layout';

/** Keep branding and the store button above gameplay, with placement owned by the interface layout. */
export function createInterface(): View {
  const container = new Container({ label: 'interface' });

  const logo = createLogo();
  const cta = createPersistentCta();

  const layout = createLayout(createInterfaceLayout());

  layout.attach('logo', logo);
  if (cta) {
    layout.attach('cta', cta.container);
  }

  container.addChild(layout.container);

  const removeResize = playable.on('resize', resize);
  const removeComplete = playable.on('complete', hideCta);

  return { container, destroy };

  function resize(): void {
    layout.update(createInterfaceLayout());
  }

  function hideCta(): void {
    if (cta) {
      cta.container.visible = false;
      cta.container.eventMode = 'none';
    }
  }

  function destroy(): void {
    removeResize();
    removeComplete();
    layout.destroy();
    logo.destroy({ children: true });
    cta?.destroy();
    container.destroy();
  }
}
