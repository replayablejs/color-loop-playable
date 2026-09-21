import { release } from '@replayablejs/tween';
import { Container } from 'pixi.js';

import type { DistributorStack, DistributorStackChip } from '#types/distributor-stack';
import type { ChipColor } from '#types/level';

import { levelStyle } from '../../config/level';
import { createTile } from '../tile/create-tile';
import { animateStackEntry, animateStackShift } from './animate-distributor-stack';
import { distributorStyle } from './configs/distributor-style';

/** Queue order is oldest-first; artwork is drawn bottom-to-top. */
export function createDistributorStack(): DistributorStack {
  const container = new Container({ label: 'distributor-stack' });
  const { bottomY, step } = distributorStyle.stack;

  let chips: DistributorStackChip[] = [];
  let insertionSequence = 0;

  container.once('destroyed', stopAnimations);

  return { container, setQueue, takeChip };

  function setQueue(colors: readonly ChipColor[]): void {
    const samePrefix = chips.every((chip, index) => chip.color === colors[index]);
    if (samePrefix && colors.length === chips.length) {
      return;
    }

    const addingChip = samePrefix && colors.length === chips.length + 1;
    stopAnimations();
    synchronizeChips(colors);

    if (addingChip) {
      animateInsertion();
    } else {
      settlePositions();
    }

    // The oldest chip must remain above every chip queued after it.
    for (const chip of [...chips].reverse()) {
      container.addChild(chip.container);
    }
  }

  /** Hand the top artwork to the throw without destroying or recreating it. */
  function takeChip(): Container | undefined {
    stopAnimations();
    const chip = chips.shift()?.container;
    // A feed can interrupt insertion. The unchanged queue may skip setQueue's
    // next update, so settle the remaining chips now rather than leaving them mid-entry.
    settlePositions();
    return chip;
  }

  /** Preserve matching artwork, create additions, and destroy removed colors. */
  function synchronizeChips(colors: readonly ChipColor[]): void {
    const unusedChips = [...chips];
    chips = colors.map((color) => {
      const match = unusedChips.findIndex((chip) => chip.color === color);
      if (match !== -1) {
        return unusedChips.splice(match, 1)[0];
      }
      return { color, container: createTile('dot', levelStyle.chipSize, color) };
    });
    for (const chip of unusedChips) {
      chip.container.destroy({ children: true });
    }
  }

  /** Enter the new bottom chip while the existing stack lifts and settles. */
  function animateInsertion(): void {
    const bottomIndex = chips.length - 1;
    chips.forEach((chip, index) => {
      const y = getChipY(index);
      chip.animation =
        index === bottomIndex
          ? animateStackEntry(chip.container, y, insertionSequence)
          : animateStackShift(chip.container, y, index, chips.length, insertionSequence);
    });
    insertionSequence++;
  }

  function settlePositions(): void {
    chips.forEach((chip, index) => {
      chip.container.y = getChipY(index);
    });
  }

  function getChipY(index: number): number {
    return bottomY - (chips.length - index - 1) * step;
  }

  /** Keep current positions, but remove transient scale, tilt, and pending writes. */
  function stopAnimations(): void {
    for (const chip of chips) {
      chip.animation?.stop();
      chip.animation = undefined;
      release(chip.container);
      // Scale is a separate target in the entry animation.
      release(chip.container.scale);
      chip.container.alpha = 1;
      chip.container.rotation = 0;
      chip.container.scale.set(1);
    }
  }
}
