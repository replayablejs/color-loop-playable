import type {
  ConveyorHit,
  LevelModel,
  LevelModelOptions,
  LevelOutcome,
  MatchResult,
} from '#types/level-model';

import { createLevelState } from './create-level-state';
import { findBoardMatch } from './find-board-match';
import { refreshColors } from './refresh-colors';

/** Own the board, queue, and sockets; report wins and losses independently of visuals. */
export function createLevelModel({ config, onOutcome }: LevelModelOptions): LevelModel {
  const state = createLevelState(config);
  const queueCapacity = config.level.distributor.capacity;
  let revision = 0;

  refreshColors(state);
  // An empty starting board is already won; construction does not emit callbacks.
  if (state.board.every((row) => row.every((cell) => cell === null))) {
    state.status = 'won';
  }

  return {
    get revision() {
      return revision;
    },
    // Snapshots prevent callers from changing model state through its getters.
    get board() {
      return state.board.map((row) => row.map((chip) => (chip ? { ...chip } : null)));
    },
    get controls() {
      return [...state.controls];
    },
    get distributorQueue() {
      return [...state.queue];
    },
    get sockets() {
      return state.sockets.map((chip) => (chip ? { ...chip } : null));
    },
    get status() {
      return state.status;
    },
    queueForDistributor,
    loadSocket,
    resolveCrossings,
    addTravelDistance,
    checkLoss,
  };

  /** Move a control chip into the queue only when capacity is available. */
  function queueForDistributor(controlIndex: number): boolean {
    const color = state.controls[controlIndex];
    if (state.status !== 'playing' || color == null || state.queue.length >= queueCapacity) {
      return false;
    }

    state.queue.push(color);
    state.controls[controlIndex] = null;
    refreshColors(state);
    revision++;
    return true;
  }

  /** Load the next queued color when an empty socket crosses the distributor. */
  function loadSocket(socketIndex: number): boolean {
    if (state.status !== 'playing' || state.sockets[socketIndex] !== null) {
      return false;
    }

    const color = state.queue.shift();
    if (color === undefined) {
      return false;
    }

    state.sockets[socketIndex] = { color, distance: 0 };
    state.consumedHits[socketIndex].clear();
    revision++;
    return true;
  }

  /** Resolve a crossing, then apply a successful clear to the board and carrier. */
  function resolveCrossings(socketIndex: number, hits: readonly ConveyorHit[]): MatchResult {
    const chip = state.sockets[socketIndex];
    if (state.status !== 'playing' || chip == null) {
      return { status: 'none', chain: [] };
    }

    const eligibleHits = getUnprocessedCrossings(socketIndex, hits);
    const result = findBoardMatch(state, chip.color, eligibleHits);

    if (result.hitId !== undefined) {
      state.consumedHits[socketIndex].add(result.hitId);
    }
    if (result.status !== 'clear') {
      return result;
    }

    for (const { row, column } of result.chain) {
      state.board[row][column] = null;
    }
    state.sockets[socketIndex] = null;
    state.consumedHits[socketIndex].clear();
    refreshColors(state);
    revision++;

    const boardEmpty = state.board.every((row) => row.every((cell) => cell === null));
    if (boardEmpty) {
      finish('won');
    }
    return result;
  }

  /**
   * Add this movement step's travelled distance to the chip in socket `socketIndex`.
   * `distance` is a positive increment in local route units, not elapsed time,
   * total distance, or a signed offset. Both conveyor directions add distance.
   *
   * Feeding resets the total to zero. If loaded partway through a step, count only
   * movement after loading. Empty sockets, finished games, and invalid increments
   * are ignored. This records lap progress only; it does not move the socket.
   * `checkLoss` later compares each occupied socket's total with the route length.
   */
  function addTravelDistance(socketIndex: number, distance: number): void {
    const chip = state.sockets[socketIndex];
    if (state.status !== 'playing' || chip == null || !Number.isFinite(distance) || distance <= 0) {
      return;
    }

    state.sockets[socketIndex] = {
      color: chip.color,
      distance: chip.distance + distance,
    };
  }

  /** Run after this step's matches, allowing a final clear to win before checking loss. */
  function checkLoss(routeLength: number): void {
    if (state.status !== 'playing' || !Number.isFinite(routeLength) || routeLength <= 0) {
      return;
    }

    const allSocketsStuck =
      state.sockets.length > 0 &&
      state.sockets.every((chip) => chip !== null && chip.distance >= routeLength);
    if (allSocketsStuck) {
      finish('lost');
    }
  }

  /** Commit the result before notifying, so later actions cannot finish it again. */
  function finish(outcome: LevelOutcome): void {
    if (state.status !== 'playing') {
      return;
    }
    state.status = outcome;
    onOutcome(outcome);
  }

  /**
   * Return board-ray crossings this socket has not processed yet.
   * A socket can touch the same ray across several frames; processing it once
   * prevents a blocked chain from triggering rejection on every frame.
   *
   * `hits` must include every currently detected crossing, even processed ones.
   * When a crossing disappears, forget its ID so the socket can try it again on
   * a later pass. Pass [] through `resolveCrossings` when the socket leaves all rays.
   *
   * History is per socket. This helper forgets old crossings and filters the
   * current ones; `resolveCrossings` marks only the crossing selected by its result.
   */
  function getUnprocessedCrossings(
    socketIndex: number,
    hits: readonly ConveyorHit[],
  ): ConveyorHit[] {
    const consumed = state.consumedHits[socketIndex];
    const activeIds = new Set(hits.map((hit) => hit.id));

    for (const id of consumed) {
      if (!activeIds.has(id)) {
        consumed.delete(id);
      }
    }

    return hits.filter((hit) => !consumed.has(hit.id));
  }
}
