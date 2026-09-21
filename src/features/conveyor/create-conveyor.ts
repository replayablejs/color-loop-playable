import { Container } from 'pixi.js';

import type { ConveyorArrowTransform } from '#types/conveyor-arrow';
import type { ConveyorView } from '#types/gameplay';
import type { LevelConfig, RoutePoint } from '#types/level';
import type { CarriedChip } from '#types/level-model';

import { createRouteSampler } from '../../math/create-route-sampler';
import { createConveyorArrow } from './create-conveyor-arrow';
import { createConveyorBelt } from './create-conveyor-belt';
import { createConveyorRoute, getSocketPositions } from './create-conveyor-route';
import { createConveyorSocket } from './create-conveyor-socket';
import { getConveyorArrows } from './get-conveyor-arrows';

/** Compose the fixed belt and moving sockets, then reflect model changes. */
export function createConveyor(config: LevelConfig['level']['conveyor']): ConveyorView {
  const container = new Container({ label: 'conveyor' });

  const socketCount = config.carrier.sockets;

  const route = createConveyorRoute(config);
  const belt = createConveyorBelt(route);
  const arrows = Array.from({ length: socketCount }, () => createConveyorArrow());
  const sockets = Array.from({ length: socketCount }, () => createConveyorSocket());

  container.addChild(belt, ...arrows, ...sockets.map((socket) => socket.container));
  // Moving chips and decorative shadows must not change the conveyor's fit.
  container.boundsArea = belt.boundsArea?.clone();
  updatePositions(
    getSocketPositions(route, sockets.length),
    getConveyorArrows(
      createRouteSampler(route),
      sockets.length,
      0,
      config.carrier.direction === 'clockwise',
    ),
  );

  return { container, updatePositions, refresh };

  function updatePositions(
    socketPositions: readonly RoutePoint[],
    arrowTransforms: readonly ConveyorArrowTransform[],
  ): void {
    socketPositions.forEach((position, index) => {
      sockets[index].container.position.set(...position);
    });
    arrowTransforms.forEach(({ position, rotation }, index) => {
      arrows[index].position.set(...position);
      arrows[index].rotation = rotation;
    });
  }

  function refresh(socketChips: readonly (CarriedChip | null)[]): void {
    sockets.forEach((socket, index) => socket.setColor(socketChips[index]?.color ?? null));
  }
}
