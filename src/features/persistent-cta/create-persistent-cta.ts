import { playable } from '@replayablejs/runtime';

import type { View } from '#types/view';

import { createStoreCta } from '../store-cta/create-store-cta';

/** Gameplay CTA visibility follows the resolved network policy. */
export function createPersistentCta(): View | undefined {
  if (!playable.config.controls.persistentCta) {
    return undefined;
  }
  return createStoreCta();
}
