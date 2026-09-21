import { Container } from 'pixi.js';

import type { DistributorView } from '#types/conveyor-feed';
import type { ChipColor, LevelConfig } from '#types/level';

import { createDistributorCounter } from './create-distributor-counter';
import { createDistributorStack } from './create-distributor-stack';
import { createDistributorTray } from './create-distributor-tray';

/** Compose the tray, animated queue, and capacity counter. */
export function createDistributor(config: LevelConfig['level']['distributor']): DistributorView {
  const container = new Container({ label: 'distributor' });

  const tray = createDistributorTray();
  const stack = createDistributorStack();
  const counter = createDistributorCounter(0, config.capacity);

  let chipInTransit = false;

  container.addChild(tray, stack.container, counter.container);
  // The queue can grow upward without changing the level's fitted size.
  container.boundsArea = container.getLocalBounds().rectangle.clone();

  return { container, refresh, takeChip, finishFeed };

  function takeChip() {
    chipInTransit = true;
    return stack.takeChip();
  }

  function finishFeed(queue: readonly ChipColor[]): void {
    chipInTransit = false;
    refresh(queue);
  }

  function refresh(queue: readonly ChipColor[]): void {
    // The flying chip stays in the model queue until it lands, so it still counts toward capacity.
    counter.setCount(queue.length);

    // Its artwork has left the stack; omit it here to avoid drawing it twice.
    const stackedColors = chipInTransit ? queue.slice(1) : queue;
    stack.setQueue(stackedColors);
  }
}
