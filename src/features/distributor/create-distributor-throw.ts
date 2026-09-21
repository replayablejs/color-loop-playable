import { Container } from 'pixi.js';

import type { DistributorThrow } from '#types/conveyor-feed';
import type { RoutePoint } from '#types/level';

import { feedAnimation } from '../../config/feed-animation';

/** Artwork stays in level coordinates, so resize scales flight and belt together. */
export function createDistributorThrow(chip: Container, landing: RoutePoint): DistributorThrow {
  const container = new Container({ label: 'distributor-throw' });
  const parent = chip.parent!;
  const startX = chip.x;
  const startY = chip.y;

  container.position.set(startX, startY);
  parent.addChild(container);
  container.addChild(chip);
  chip.position.set(0, 0);

  return { update, destroy };

  function update(progress: number): void {
    container.position.set(
      startX + (landing[0] - startX) * progress,
      startY + (landing[1] - startY) * progress,
    );
    // Mirrored halves reproduce power3 out/in lift and power2 out/in scale.
    // Both start and end at rest; the peak is halfway through the flight.
    const halfProgress = Math.min(progress, 1 - progress) * 2;
    chip.y = -feedAnimation.lift * (1 - (1 - halfProgress) ** 4);
    const scale = 1 + (feedAnimation.peakScale - 1) * (1 - (1 - halfProgress) ** 3);
    chip.scale.set(scale);
  }

  function destroy(): void {
    container.destroy({ children: true });
  }
}
