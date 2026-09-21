import type { ConveyorMovement, ConveyorMovementOptions } from '#types/gameplay';
import type { RoutePoint } from '#types/level';

import { createConveyorRoute } from '../features/conveyor/create-conveyor-route';
import { getConveyorArrows } from '../features/conveyor/get-conveyor-arrows';
import { createRouteSampler } from '../math/create-route-sampler';
import { createBoardCrossingChecker } from './create-board-crossing-checker';
import { createConveyorFeeder } from './create-conveyor-feeder';

/** Move sockets along the route and apply feeding/matches through the model. */
export function createConveyorMovement({
  config,
  model,
  throwEvents,
  onMatch,
  onPositionsChange,
}: ConveyorMovementOptions): ConveyorMovement {
  let offset = 0;
  let completed = false;

  const { sockets: socketCount, speed, direction } = config.level.conveyor.carrier;
  const clockwise = direction === 'clockwise';
  const signedSpeed = clockwise ? speed : -speed;

  const route = createConveyorRoute(config.level.conveyor);
  const sampler = createRouteSampler(route);
  const checkCrossings = createBoardCrossingChecker({
    config: config.level.board,
    model,
    onMatch,
  });

  const socketSpacing = sampler.length / socketCount;
  const feeder = createConveyorFeeder({
    sampler,
    route,
    speed: signedSpeed,
    model,
    throwEvents,
  });

  return { update, complete };

  /** Travel always continues; only active gameplay can feed chips or resolve matches. */
  function update(deltaSeconds: number): void {
    if (deltaSeconds <= 0) {
      return;
    }

    const travel = signedSpeed * deltaSeconds;
    if (!completed && model.status === 'playing') {
      updateGameplay(travel);
    }

    // Wrap in both directions so the route offset stays within one lap.
    offset = (((offset + travel) % sampler.length) + sampler.length) % sampler.length;
    const socketPositions = Array.from({ length: socketCount }, (_, index) =>
      sampler.position(offset + index * socketSpacing),
    );
    const arrowTransforms = getConveyorArrows(sampler, socketCount, offset, clockwise);
    onPositionsChange(socketPositions, arrowTransforms);
  }

  /** Explicitly stop feeding and matching while the belt keeps moving. */
  function complete(): void {
    completed = true;
    feeder.cancelThrow();
  }

  /** Resolve every match before checking loss; cancel invalid throws before the loss check. */
  function updateGameplay(travel: number): void {
    for (let socketIndex = 0; socketIndex < socketCount; socketIndex++) {
      if (model.status !== 'playing') {
        break;
      }
      advanceSocket(socketIndex, travel);
    }

    feeder.cancelThrowIfInvalid();
    model.checkLoss(sampler.length);
  }

  /** Feed one socket, then check the movement made with a chip aboard. */
  function advanceSocket(socketIndex: number, travel: number): void {
    const startDistance = offset + socketIndex * socketSpacing;
    const wasLoaded = model.sockets[socketIndex] !== null;
    const travelBeforeLanding = feeder.advance(socketIndex, startDistance, travel);
    if (travelBeforeLanding === undefined) {
      return;
    }

    // Existing chips use the whole frame; newly loaded chips start at landing.
    const loadedStartDistance = startDistance + travelBeforeLanding;
    if (!wasLoaded) {
      const landing = sampler.position(loadedStartDistance);
      checkCrossings(socketIndex, landing, landing);
    }

    // Split at corners so checks follow the belt, not a shortcut across it.
    const loadedTravel = travel - travelBeforeLanding;
    for (const { start, end } of sampler.trace(loadedStartDistance, loadedTravel)) {
      processLoadedSegment(socketIndex, start, end);
    }
  }

  /** Check only the part travelled with a chip aboard, after its landing. */
  function processLoadedSegment(socketIndex: number, start: RoutePoint, end: RoutePoint): void {
    // Empty-socket travel before feeding does not count toward a full lap.
    const distance = Math.hypot(end[0] - start[0], end[1] - start[1]);
    model.addTravelDistance(socketIndex, distance);

    checkCrossings(socketIndex, start, end);
  }
}
