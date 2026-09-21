import type { ConveyorFeeder, ConveyorFeederOptions, PendingThrow } from '#types/conveyor-feed';
import type { RectangleBounds } from '#types/geometry';

import { feedAnimation } from '../config/feed-animation';
import { levelStyle } from '../config/level';
import { playSound } from '../features/audio/play-sound';
import { getSegmentRectangleEntry } from '../math/get-segment-rectangle-entry';

/** Time each throw so the chip and its reserved socket meet below the tray. */
export function createConveyorFeeder({
  sampler,
  route,
  speed,
  model,
  throwEvents,
}: ConveyorFeederOptions): ConveyorFeeder {
  let pendingThrow: PendingThrow | undefined;

  const throwDurationSeconds = Math.min(
    feedAnimation.maxDuration,
    Math.max(feedAnimation.minDuration, feedAnimation.travelDistance / Math.abs(speed)),
  );
  // Socket travel during the flight, not the distance covered by the airborne artwork.
  const throwTravelDistance = Math.abs(speed) * throwDurationSeconds;

  // A zero-width rectangle detects the bottom route's crossing beneath the tray.
  const routeBottom = Math.max(...route.map(([, y]) => y));
  const landingLine: RectangleBounds = {
    left: 0,
    right: 0,
    top: routeBottom - levelStyle.chipSize * 0.6,
    bottom: routeBottom + levelStyle.chipSize * 0.6,
  };

  return { advance, cancelThrowIfInvalid, cancelThrow };

  /**
   * Advance one socket's feed for this frame. Distances use local route units.
   * Return 0 for an already loaded socket, signed travel before a new landing,
   * or undefined while the socket remains empty. This lets the caller check
   * board crossings only along the part travelled with a chip aboard.
   */
  function advance(socketIndex: number, startDistance: number, travel: number): number | undefined {
    cancelThrowIfInvalid();

    if (model.sockets[socketIndex] != null) {
      return 0;
    }

    const travelBeforeLaunch = pendingThrow ? 0 : startThrow(socketIndex, startDistance, travel);
    if (travelBeforeLaunch === undefined || pendingThrow?.socketIndex !== socketIndex) {
      return undefined;
    }

    // A throw can begin partway through this frame. Only the remaining movement
    // advances it; save the landing distance before consuming that movement.
    const travelBeforeLanding = travelBeforeLaunch + pendingThrow.remainingDistance;
    const travelDuringThrow = Math.abs(travel) - travelBeforeLaunch;
    pendingThrow.remainingDistance -= travelDuringThrow;

    const progress = Math.min(1, 1 - pendingThrow.remainingDistance / throwTravelDistance);
    throwEvents.update(progress);

    if (pendingThrow.remainingDistance > 0) {
      return undefined;
    }

    const loaded = model.loadSocket(socketIndex);
    if (loaded) {
      playSound('chip-landing');
    }
    finishThrow();

    // The caller uses movement after landing for board matches and lap limits.
    return loaded ? Math.sign(travel) * travelBeforeLanding : undefined;
  }

  /** Start a throw and return how far into this frame its launch occurs. */
  function startThrow(
    socketIndex: number,
    startDistance: number,
    travel: number,
  ): number | undefined {
    const color = model.distributorQueue[0];
    if (color == null || speed === 0) {
      return undefined;
    }

    // Look one throw ahead along the route. When that future position crosses
    // the landing line, launching now makes the chip arrive with the socket.
    const lookAheadDistance = Math.sign(travel) * throwTravelDistance;
    for (const segment of sampler.trace(startDistance + lookAheadDistance, travel)) {
      const crossing = getSegmentRectangleEntry(segment.start, segment.end, landingLine);
      if (!crossing) {
        continue;
      }

      // segment.distance includes the whole segment. Subtract the portion past
      // the crossing to obtain the exact movement before launch, even at low FPS.
      const segmentLength = Math.hypot(
        segment.end[0] - segment.start[0],
        segment.end[1] - segment.start[1],
      );
      const distancePastCrossing = segmentLength * (1 - crossing.progress);
      const travelBeforeLaunch = segment.distance - distancePastCrossing;

      pendingThrow = { socketIndex, color, remainingDistance: throwTravelDistance };
      throwEvents.start(crossing.point);
      return travelBeforeLaunch;
    }

    return undefined;
  }

  /**
   * Cancel the pending throw if the game ended or its color is no longer first
   * in the queue. Another socket can clear that color while this chip is flying.
   */
  function cancelThrowIfInvalid(): void {
    if (pendingThrow == null) {
      return;
    }

    if (model.status === 'playing' && model.distributorQueue[0] === pendingThrow.color) {
      return;
    }

    finishThrow();
  }

  /** Cancel an active throw without loading its reserved socket. */
  function cancelThrow(): void {
    if (pendingThrow == null) {
      return;
    }
    finishThrow();
  }

  function finishThrow(): void {
    pendingThrow = undefined;
    throwEvents.finish(model.distributorQueue);
  }
}
