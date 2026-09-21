import type { LevelConfig, RoutePoint } from '#types/level';

import { levelStyle } from '../../config/level';
import { createRouteSampler } from '../../math/create-route-sampler';

/**
 * Convert normalized shape coordinates into local artwork units.
 * The authored center (0.5, 0.5) becomes (0, 0), matching the board's origin.
 * Stage scale changes the route size; responsive layout scales the whole level later.
 */
export function createConveyorRoute(config: LevelConfig['level']['conveyor']): RoutePoint[] {
  const routeSize = levelStyle.size * config.scale;

  return config.shape.map(([x, y]) => [(x - 0.5) * routeSize, (y - 0.5) * routeSize]);
}

/**
 * Place sockets at equal travel distances around the closed route.
 * Counting points would bunch sockets wherever the authored curve has more samples.
 * The first socket starts at the first route point; the endpoint is not duplicated.
 */
export function getSocketPositions(route: readonly RoutePoint[], count: number): RoutePoint[] {
  const sampler = createRouteSampler(route);
  const socketSpacing = sampler.length / count;
  return Array.from({ length: count }, (_, index) => sampler.position(index * socketSpacing));
}
