import type { ConveyorArrowTransform } from '#types/conveyor-arrow';
import type { RouteSampler } from '#types/geometry';

/** Place one arrow halfway along the route distance between neighboring sockets. */
export function getConveyorArrows(
  sampler: RouteSampler,
  count: number,
  offset: number,
  clockwise: boolean,
): ConveyorArrowTransform[] {
  const spacing = sampler.length / count;
  // Sample one local unit ahead in the travel direction to find the path heading.
  const lookAhead = clockwise ? 1 : -1;
  return Array.from({ length: count }, (_, index) => {
    const distance = offset + (index + 0.5) * spacing;
    const position = sampler.position(distance);
    const ahead = sampler.position(distance + lookAhead);
    return {
      position,
      rotation: Math.atan2(ahead[1] - position[1], ahead[0] - position[0]),
    };
  });
}
