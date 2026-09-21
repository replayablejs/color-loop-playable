import { Container } from 'pixi.js';

import type { DistributorThrow } from '#types/conveyor-feed';
import type { PlayfieldOptions, PlayfieldSnapshot, PlayfieldView } from '#types/gameplay';
import type { ChipColor, RoutePoint } from '#types/level';

import { levelStyle } from '../../config/level';
import { createBoard } from '../board/create-board';
import { createConveyor } from '../conveyor/create-conveyor';
import { createDistributor } from '../distributor/create-distributor';
import { createDistributorThrow } from '../distributor/create-distributor-throw';

/** Compose the playfield in local coordinates before responsive fitting. */
export function createPlayfield({ config, onIdle }: PlayfieldOptions): PlayfieldView {
  const container = new Container({ label: 'playfield' });

  let activeThrow: DistributorThrow | undefined;

  const conveyor = createConveyor(config.conveyor);
  const board = createBoard({ config: config.board, onIdle: notifyIdle });
  const distributor = createDistributor(config.distributor);

  // Board and belt share their center; place the tray below the visible belt.
  const conveyorBottom = conveyor.container.getLocalBounds().bottom;
  distributor.container.y = conveyorBottom + levelStyle.distributorGap;

  // The belt casts onto resting cells/chips; airborne chips pass over the belt.
  container.addChild(
    board.container,
    conveyor.container,
    distributor.container,
    board.animationLayer,
  );

  // Keep layout bounds stable as chips move and chains disappear.
  container.boundsArea = container.getLocalBounds().rectangle.clone();

  return {
    container,
    get idle() {
      return board.idle && activeThrow == null;
    },
    playMatch: board.playMatch,
    refresh,
    updateConveyorPositions: conveyor.updatePositions,
    distributorThrow: {
      start: startThrow,
      update: updateThrow,
      finish: finishThrow,
    },
  };

  function refresh({ sockets, board: boardState, distributorQueue }: PlayfieldSnapshot): void {
    conveyor.refresh(sockets);
    board.refresh(boardState);
    distributor.refresh(distributorQueue);
  }

  function startThrow(landing: RoutePoint): void {
    const chip = distributor.takeChip();
    if (chip == null) {
      return;
    }

    // The stack shares the level's horizontal origin, but sits below the belt.
    // Preserve its position when reparenting it into the playfield.
    const playfieldY = distributor.container.y + chip.y;
    container.addChild(chip);
    chip.y = playfieldY;
    activeThrow = createDistributorThrow(chip, landing);
  }

  function updateThrow(progress: number): void {
    activeThrow?.update(progress);
  }

  function finishThrow(distributorQueue: readonly ChipColor[]): void {
    activeThrow?.destroy();
    activeThrow = undefined;
    distributor.finishFeed(distributorQueue);
    notifyIdle();
  }

  function notifyIdle(): void {
    if (board.idle && activeThrow == null) {
      onIdle();
    }
  }
}
